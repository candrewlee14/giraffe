// Libraries
import React, {FunctionComponent, useEffect, useState} from 'react'
import Globe from 'react-globe.gl'
// import {Map, TileLayer} from 'react-leaflet'
// import Control from 'react-leaflet-control'

// Components
import {LayerSwitcher} from './geo/LayerSwitcher'

// Utils
import {preprocessData} from './geo/processing/tableProcessing'
import {ZOOM_FRACTION, getMinZoom, getRowLimit} from '../utils/geo'

// Types
import {Geo3DLayerConfig} from '../types/geo3D'
import {Config, Table} from '../types'
import {map} from 'd3-array'

interface Props extends Partial<Geo3DLayerConfig> {
  width: number
  height: number
  table: Table
  stylingConfig: Partial<Config>
}

const Geo3D: FunctionComponent<Props> = props => {
  const {
    allowPanAndZoom,
    height,
    lat,
    latLonColumns,
    lon,
    mapStyle,
    s2Column,
    stylingConfig,
    useS2CellID,
    width,
    zoom,
  } = props
  const mapRef = React.createRef<any>()

  useEffect(() => {
    if (width && height) {
      mapRef.current?.leafletElement._onResize()
    }
  }, [width, height])

  const {table, detectCoordinateFields} = props
  const [preprocessedTable, setPreprocessedTable] = useState(
    table
      ? preprocessData(
          table,
          getRowLimit(props.layers),
          useS2CellID || !detectCoordinateFields,
          latLonColumns,
          s2Column
        )
      : null
  )

  useEffect(() => {
    const newTable = preprocessData(
      props.table,
      getRowLimit(props.layers),
      useS2CellID || !detectCoordinateFields,
      latLonColumns,
      s2Column
    )
    setPreprocessedTable(newTable)
  }, [table, detectCoordinateFields])

  if (width === 0 || height === 0) {
    return null
  }

  const onViewportChange = (viewport: {center?: number[]; zoom?: number}) => {
    const {onViewportChange} = props
    if (onViewportChange) {
      onViewportChange(viewport.center[0], viewport.center[1], viewport.zoom)
    }
  }

  const latLon = preprocessedTable.getLatLon(0)
  const mapCenter = {
    lat: latLon ? latLon.lat : lat,
    lon: latLon ? latLon.lon : lon,
  }
  var latsAndLngs = map([...Array(preprocessedTable.getRowCount()).keys()], i =>
    preprocessedTable.getLatLon(i)
  )

  return (
    <Globe
      width={width}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      pathsData={latsAndLngs}
      pathPointLat={coord => coord.lat}
      pathPointLng={coord => coord.lon}
      pathColor={() => ['rgba(0,0,255,0.6)', 'rgba(255,0,0,0.6)']}
      pathDashLength={0.01}
      pathDashGap={0.004}
      pathDashAnimateTime={100000}
      // pathPointAlt={rise ? pnt => pnt[2] : undefined}
      pathTransitionDuration={500}
    />
  )
}

export default Geo3D
