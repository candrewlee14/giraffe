// Libraries
import React, {FunctionComponent, useEffect, useState, useRef} from 'react'
import {renderToString} from 'react-dom/server'
import {GlobeMethods} from 'react-globe.gl'
import Globe from 'react-globe.gl'
// import {Map, TileLayer} from 'react-leaflet'
// import Control from 'react-leaflet-control'

// Components

// Utils
import {preprocessData} from './geo/processing/tableProcessing'
import {GeoTooltip} from './geo/GeoTooltip'
import {getRowLimit} from '../utils/geo'
import {Tooltip} from './Tooltip'

// Types
import {Geo3DLayerConfig} from '../types/geo3D'
import {Config, LegendData, Table} from '../types'
import {Track} from './geo/processing/GeoTable'
import {getLegendData} from '../utils/legend/staticLegend'

interface Props extends Partial<Geo3DLayerConfig> {
  width: number
  height: number
  table: Table
  stylingConfig: Partial<Config>
  plotConfig: Config
}

const Geo3D: FunctionComponent<Props> = props => {
  const {
    height,
    lat,
    latLonColumns,
    lon,
    mapStyle,
    stylingConfig,
    hoverInteraction,
    width,
    colors,
    spinSpeed,
    dashTime,
    dashWeight,
    dashGap,
    dashLength,
    plotConfig,
    coloredEarth,
  } = props
  const globeRef = useRef<GlobeMethods>()

  const {table, detectCoordinateFields} = props
  const [preprocessedTable, setPreprocessedTable] = useState(
    table
      ? preprocessData(
          table,
          getRowLimit(props.layers),
          !detectCoordinateFields,
          latLonColumns,
          null
        )
      : null
  )

  useEffect(() => {
    const newTable = preprocessData(
      props.table,
      getRowLimit(props.layers),
      !detectCoordinateFields,
      latLonColumns,
      null
    )
    setPreprocessedTable(newTable)
  }, [table, detectCoordinateFields])

  useEffect(() => {
    if (globeRef.current != null) {
      ;(globeRef.current.controls() as Obj3).autoRotate =
        spinSpeed != 0 ? true : false
      ;(globeRef.current.controls() as Obj3).autoRotateSpeed = spinSpeed
      const latLon = preprocessedTable.getLatLon(0)
      if (latLon != null) {
        globeRef.current.pointOfView(
          {lat: latLon.lat, lng: latLon.lon, altitude: 2.2},
          500
        )
      }
    }
  }, [preprocessedTable, spinSpeed])

  type Obj3 = {
    autoRotate: boolean
    autoRotateSpeed: number
  }

  if (width === 0 || height === 0) {
    return null
  }

  const onViewportChange = (viewport: {center?: number[]; zoom?: number}) => {
    const {onViewportChange} = props
    if (onViewportChange) {
      onViewportChange(viewport.center[0], viewport.center[1], viewport.zoom)
    }
  }

  interface Path {
    pathIndex: number
    track: Track
  }

  const tracks = preprocessedTable.mapTracks((track, _options, index) => {
    const path: Path = {
      track: track,
      pathIndex: index,
    }
    return path
  }, null)

  return (
    <Globe
      ref={globeRef}
      enablePointerInteraction={hoverInteraction}
      width={width}
      height={height}
      globeImageUrl={
        coloredEarth
          ? 'https://unpkg.com/three-globe@2.24.6/example/img/earth-blue-marble.jpg'
          : '//unpkg.com/three-globe/example/img/earth-dark.jpg'
      }
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      backgroundColor="rgba(0,0,0,0)"
      pathsData={tracks}
      pathPoints={path => (path as Path).track}
      pathColor={path =>
        colors
          ? colors[
              ((path.pathIndex % colors.length) + colors.length) % colors.length
            ]
          : ['rgba(0,0,255,0.6)', 'rgba(255,0,0,0.6)']
      }
      pathStroke={dashWeight}
      pathDashLength={dashLength}
      pathDashGap={dashGap}
      pathDashAnimateTime={dashTime}
      pathTransitionDuration={500}
      pathLabel={p => {
        let path = p as Path
        return '<div>' + path.pathIndex.toString() + '</div>'
      }}
    />
  )
}

export default Geo3D
