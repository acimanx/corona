import React, { useState, useEffect, useRef } from 'react'

import { Map, Popup, Tooltip, Marker, TileLayer } from 'react-leaflet'
import Choropleth from 'react-leaflet-choropleth'

const coordinates = [52.187, 5.076]
const bounds = [
  [50.803721015, 3.31497114423],
  [53.5104033474, 7.09205325687],
]
const GemOverview = ({ feature, selectedGem }) => {
  const [permanent, setPermanent] = useState(null)
  useEffect(() => {
    if (selectedGem) {
      if (selectedGem.find(x => x.value === feature.id)) {
        setPermanent(true)
      } else {
        setPermanent('')
      }
    } else {
      setPermanent('')
    }
  }, [selectedGem, feature])

  return (
    <Tooltip key={permanent} permanent={permanent}>
      <h1>{feature.properties.statnaam}</h1>
      <br></br>
      <p>{feature.confirmed}</p>
    </Tooltip>
  )
}

const MapComponent = ({ appData, selectedGem }) => {
  const geo = appData.geo
  const mapRef = useRef()
  console.log(mapRef)
  //   const style = {
  //     fillColor: '#F28F3B',
  //     weight: 2,
  //     opacity: 1,
  //     color: 'white',
  //     dashArray: '3',
  //     fillOpacity: 0.5
  // }
  const myMarkers = {
    markers: [
      { key: 'marker1', position: [51.5, -0.1], content: 'My first popup' },
      { key: 'marker2', position: [51.51, -0.1], content: 'My second popup' },
      { key: 'marker3', position: [51.49, -0.05], content: 'My third popup' },
    ],
  }
  const onEachFeature = (feature, layer) => {
    layer
      .bindTooltip(feature.properties.statnaam)
      .openTooltip(
        `${feature.properties.statnaam} <br>Confirmed:${feature.confirmed}`
      )
  }
  const style = {
    fillColor: '#F28F3B',
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.5,
  }

  return (
    <Map bounds={bounds} maxBounds={bounds} className='map-container'>
      <Choropleth
        data={{ type: 'FeatureCollection', features: geo }}
        valueProperty={feature => feature.confirmed}
        scale={['green', 'red']}
        steps={7}
        mode='q'
        style={style}
        ref={mapRef}
      >
        <GemOverview selectedGem={selectedGem}></GemOverview>
      </Choropleth>
      <TileLayer url='http://{s}.tile.osm.org/{z}/{x}/{y}.png' />
    </Map>
  )
}

export default MapComponent
