import {newTable, Table} from '../../../giraffe/src'
import memoizeOne from 'memoize-one'

const now = Date.now()

function getRandomNumber(center: number, spread: number) {
  return center + (0.5 - Math.random()) * spread * 2
}

const createDataColumns = (numberOfRecords: number) => {
  const TIME_COL = []
  const VALUE1_COL = []
  const VALUE2_COL = []
  const LAT_COL = []
  const LON_COL = []
  for (let i = 0; i < numberOfRecords; i += 1) {
    VALUE1_COL.push(getRandomNumber(3.5, 3.5))
    VALUE2_COL.push(getRandomNumber(50, 30))
    LAT_COL.push(getRandomNumber(40, 3))
    LON_COL.push(getRandomNumber(-78, 3))
    TIME_COL.push(now + i * 1000 * 60)
  }
  return {TIME_COL, VALUE1_COL, VALUE2_COL, LAT_COL, LON_COL}
}

export const geoTable = memoizeOne(
  (numberOfRecords = 200): Table => {
    const columns = createDataColumns(numberOfRecords)
    return newTable(numberOfRecords)
      .addColumn('_time', 'dateTime:RFC3339', 'time', columns.TIME_COL)
      .addColumn('magnitude', 'double', 'number', columns.VALUE1_COL)
      .addColumn('duration', 'double', 'number', columns.VALUE2_COL)
      .addColumn('lat', 'double', 'number', columns.LAT_COL)
      .addColumn('lon', 'double', 'number', columns.LON_COL)
  }
)

interface Point {
  lat: number
  lon: number
}

const normalize = (pt: Point) => {
  const norm = Math.sqrt(Math.pow(pt.lat, 2) + Math.pow(pt.lon, 2))
  pt.lat /= norm
  pt.lon /= norm
  return pt
}

const addTrack = (data, startLat: number, startLon: number, iters: number) => {
  const tid = Math.floor(Math.random() * 1000)
  let lat = startLat,
    lon = startLon
  let delta = {
    lat: (Math.random() - 0.5) * 1.5,
    lon: (Math.random() - 0.5) * 1.5,
  }
  for (let i = 0; i < iters; i++) {
    const time = now + i * 1000 * 60
    delta.lat += (Math.random() - 0.5) / 20
    delta.lon += (Math.random() - 0.5) / 20
    delta = normalize(delta)
    lat += delta.lat
    lon += delta.lon
    data.push({time, lat, lon, tid})
  }
}

export const geoTracks = memoizeOne(
  (lon: number, lat: number, iters: number, count = 1): Table => {
    const data = []
    for (let i = 0; i < count; i++) {
      addTrack(data, lat - 4, lon - 6, iters)
    }
    return newTable(data.length)
      .addColumn(
        '_time',
        'dateTime:RFC3339',
        'time',
        data.map(x => x.time)
      )
      .addColumn(
        'lat',
        'double',
        'number',
        data.map(x => x.lat)
      )
      .addColumn(
        'lon',
        'double',
        'number',
        data.map(x => x.lon)
      )
      .addColumn(
        'table',
        'double',
        'number',
        data.map(x => x.tid)
      )
  }
)
