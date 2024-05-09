#!/usr/bin/env node

const fs = require('fs')
const readline = require('readline')
const bboxPolygon = require('@turf/bbox-polygon').default
const featureCollection = require('@turf/helpers').featureCollection
const omit = require('lodash.omit')

async function processLineByLine() {
  const fileStream = fs.createReadStream('/dev/stdin')

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  const features = []
  for await (const line of rl) {
    const region = JSON.parse(line)
    const feature = {
      type: 'Feature',
      properties: omit(region, ['bounds', 'geometry'])
    }

    if (region.geometry) {
      feature.geometry = region.geometry
    } else if (region.bounds) {
      feature.geometry = bboxPolygon([region.bounds[1], region.bounds[0], region.bounds[3], region.bounds[2]]).geometry;
    } else {
      feature.geometry = null
    }

    features.push(feature)
  }
  console.log(JSON.stringify(featureCollection(features), null, 2))
}

processLineByLine()
