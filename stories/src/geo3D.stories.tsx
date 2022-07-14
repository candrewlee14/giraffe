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
  colorSchemeKnob,
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
  const pointCount = number('Step count', 30, {
    range: true,
    min: 0,
    max: 300,
    step: 1,
  })
  // const zoom = number('Zoom', 6, {
  //   range: true,
  //   min: 1,
  //   max: 20,
  //   step: 1,
  // })
  // const allowPanAndZoom = boolean('Allow pan and zoom', true)
  // const useS2CellID = boolean('Use S2 Cell ID', true)

  return {latitude, longitude, pointCount}
}

const trackKnobs = () => {
  const dashTime = number('Dash time', 30_000, {
    range: true,
    min: 1_000,
    max: 100_000,
    step: 50,
  })

  const dashWeight = number('Dash weight', 2, {
    range: true,
    min: 0.1,
    max: 10,
    step: 0.1,
  })

  const dashLength = number('Dash length', 0.1, {
    range: true,
    min: 0.01,
    max: 0.5,
    step: 0.01,
  })

  const dashGap = number('Dash gap', 0.01, {
    range: true,
    min: 0.01,
    max: 0.5,
    step: 0.01,
  })

  const spinSpeed = number('Spin speed', 0.5, {
    range: true,
    min: -10,
    max: 10,
    step: 0.5,
  })

  const enableHover = boolean('Enable hover tooltip', true)

  const pathChaos = number('Path chaos', 0.5, {
    range: true,
    min: 0.05,
    max: 20,
    step: 0.05,
  })

  return {
    spinSpeed,
    dashTime,
    dashWeight,
    dashGap,
    dashLength,
    enableHover,
    pathChaos
  }
}

geo3D.add('Tracks', () => {
  const numberOfTracks = number('Track count', 3, {
    range: true,
    min: 0,
    max: 100,
    step: 1,
  })
  const {latitude, longitude, pointCount} = genericKnobs()
  const {
    spinSpeed,
    dashTime,
    dashWeight,
    dashGap,
    dashLength,
    enableHover,
    pathChaos,
  } = trackKnobs()
  const config: Config = {
    table: geoTracks(longitude, latitude, pointCount, numberOfTracks, pathChaos),
    showAxes: false,
    layers: [
      {
        type: 'geo3D',
        colors: colorSchemeKnob(),
        lat: latitude,
        lon: longitude,
        hoverInteraction: enableHover,
        dashTime,
        dashWeight,
        dashGap,
        dashLength,
        spinSpeed,
        detectCoordinateFields: false,
        layers: [
          // {
          //   type: 'trackMap',
          //   speed,
          //   trackWidth,
          //   randomColors,
          //   endStopMarkers,
          //   endStopMarkerRadius,
          //   colors: randomColors
          //     ? undefined
          //     : [
          //         {type: 'min', hex: color1},
          //         {type: 'max', hex: color2},
          //       ],
          // },
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
