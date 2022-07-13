import * as React from 'react'
import {storiesOf} from '@storybook/react'
import {
  boolean,
  color,
  number,
  select,
  withKnobs,
  text,
} from '@storybook/addon-knobs'

import {Config, Plot} from '../../giraffe/src'

import {
  PlotContainer,
  lattitudeKnob,
  longitudeKnob,
  s2GeoHashKnob,
} from './helpers'
import {geoTable, geoTracks} from './data/geoLayer'
import {ClusterAggregation} from '../../giraffe/src/types/geo'
import {fromFlux} from '../../giraffe/src'
import {geoCSV} from './data/geo'

const osmTileServerConfiguration = {
  tileServerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
}

const bingTileServerConfiguration = {
  // The code here is for Giraffe demo purposes only, do not use it in your own
  // projects. To get a bing maps API key, go to:
  //
  // https://docs.microsoft.com/en-us/bingmaps/getting-started/bing-maps-dev-center-help/getting-a-bing-maps-key
  bingKey: 'AtqWbnKXzGMWSAsgWknAw2cgBKuGIm9XmSbaS4fSebC5U6BdDTUF3I__u5NAp_Zi',
}

const geo3D = storiesOf('Geo3D', module).addDecorator(withKnobs)

const genericKnobs = () => {
  const latitude = number('Latitude', 40, {
    range: true,
    min: -90,
    max: 90,
    step: 1,
  })
  const longitude = number('Longitude', -76, {
    range: true,
    min: -180,
    max: 180,
    step: 1,
  })
  const zoom = number('Zoom', 6, {
    range: true,
    min: 1,
    max: 20,
    step: 1,
  })
  const allowPanAndZoom = boolean('Allow pan and zoom', true)
  const useS2CellID = boolean('Use S2 Cell ID', true)

  return {allowPanAndZoom, latitude, longitude, zoom, useS2CellID}
}

const trackKnobs = () => {
  const speed = number('Speed', 200, {
    range: true,
    min: 1,
    max: 10000,
    step: 1,
  })

  const trackWidth = number('Track width', 4, {
    range: true,
    min: 1,
    max: 15,
    step: 1,
  })
  const color1 = color('Track color 1', '#0000ff')
  const color2 = color('Track color 2', '#f0f0ff')
  const randomColors = boolean('Random colors', true)

  const endStopMarkers = boolean('End stop markers', true)
  const endStopMarkerRadius = number('End stop marker radius', 4, {
    range: true,
    min: 1,
    max: 100,
    step: 1,
  })

  return {
    speed,
    trackWidth,
    randomColors,
    color1,
    color2,
    endStopMarkers,
    endStopMarkerRadius,
  }
}

geo3D.add('Tracks', () => {
  const numberOfTracks = number('Track count', 3, {
    range: true,
    min: 0,
    max: 100,
    step: 1,
  })
  const {allowPanAndZoom, latitude, longitude, zoom} = genericKnobs()
  const {
    speed,
    trackWidth,
    randomColors,
    color1,
    color2,
    endStopMarkers,
    endStopMarkerRadius,
  } = trackKnobs()
  const config: Config = {
    table: geoTracks(-74, 40, 100, numberOfTracks),
    showAxes: false,
    layers: [
      {
        type: 'geo3D',
        lat: latitude,
        lon: longitude,
        zoom,
        allowPanAndZoom,
        detectCoordinateFields: false,
        layers: [
          {
            type: 'trackMap',
            speed,
            trackWidth,
            randomColors,
            endStopMarkers,
            endStopMarkerRadius,
            colors: randomColors
              ? undefined
              : [
                  {type: 'min', hex: color1},
                  {type: 'max', hex: color2},
                ],
          },
        ],
        tileServerConfiguration: osmTileServerConfiguration,
      },
    ],
  }
  return (
    <PlotContainer>
      <Plot config={config} />
    </PlotContainer>
  )
})
