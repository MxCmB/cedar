import * as utils from 'cedar-utils'

function _defaultTransformFunc(feature: any) {
  return feature.attributes
}

export function getTransformFunc(transformFunc) {
  return typeof transformFunc === 'function' ? transformFunc : _defaultTransformFunc
}

export function buildIndex(joinKeys, featureSets, transformFuncs) {
  const index = {}
  featureSets.forEach((featureSet, i) => {
    const transformFunc = getTransformFunc(transformFuncs[i])
    featureSet.features.forEach((features, j) => {
      const idx = features.attributes[joinKeys[i]]
      if (index[idx] === undefined) {
        index[idx] = []
      }
      index[idx].push(transformFunc(features))
    })
  })
  return index
}

export function flattenFeatures(data) {
  // TODO: Transform data
  const joinKeys: any[] = data.joinKeys
  const featureSets: any[] = data.featureSets
  const transformFuncs: any[] = data.transformFuncs
  const features = []

  // If we aren't joining, but we are merging
  if (joinKeys.length === 0) {
    return featureSets.reduce((flat, fsToFlatten) => {
      return flat.concat(utils.query.fsToArr(fsToFlatten))
    }, [])
  }

  // Otherwise join
  const index = buildIndex(joinKeys, featureSets, transformFuncs)
  const key = joinKeys[0] // TODO: support different `category` keys
  const keys = Object.keys(index)
  keys.forEach((indKey, i) => {
    const idxArr = index[indKey]
    const feature = { categoryField: idxArr[0][key] }
    idxArr.forEach((idx, k) => {
      const attrKeys = Object.keys(idx)
      attrKeys.forEach((ak, j) => {
        const attr = `${ak}_${k}`
        feature[attr] = idx[ak]
      })
    })
    features.push(feature)
  })

  return features
}

export default flattenFeatures
