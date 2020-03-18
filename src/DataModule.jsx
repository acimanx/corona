import React, { useState, useEffect, useMemo } from 'react'
import gem from './data/gemeente_2020.json'
import daily from './data/daily.csv'
import table from './data/table.csv'

import MapComponent from './MapComponent'
import useSWR from 'swr'

import Select from 'react-select'

import DatePicker from 'react-datepicker'
import { parseISO, formatISO } from 'date-fns'

import Papa from 'papaparse'

const Overview = ({ selectedGem }) => {
  return selectedGem.map(x => (
    <>
      <div className='gem-container-box'>
        <h1>{x.properties.statnaam}</h1>
        <p>Confirmed: {x.confirmed}</p>
      </div>
    </>
  ))
}

const filterData = (daily, all, startDate) => {
  const date = 'Datum'
  const total = 'Aantal'
  const startDateISO = '2020-03-14'
  const code = 'Gemeentecode'
  const muni = 'Gemeentenaam'
  const prov = 'Provincienaam'

  const first = parseISO(daily[0][date])
  const last = parseISO(daily.slice(-1)[0][date])

  console.log(daily)
  let startDateT
  if (startDate) {
    const startDateToIso = formatISO(startDate, { representation: 'date' })
    startDateT = startDateToIso
  }
  if (!startDate) {
    startDateT = formatISO(last, { representation: 'date' })
  }

  const dailyC = daily.map(d => {
    return {
      date: d[date],
      total: d[total],
    }
  })
  const dailyDefault = () => {
    if (startDate) {
      const selected = daily.find(d => d[date] === startDateT)
      return parseISO(selected[date])
    } else {
      return last
    }
  }

  const dailyFilter = { min: first, max: last, default: dailyDefault() }

  const transMuniCode = code => 'GM' + code.padStart(4, '0')

  const allFilter = all.map(d => {
    return {
      id: transMuniCode(d[code]),
      confirmed: d[startDateT],
    }
  })
  const mergeById = (a1, a2) =>
    a1.map(itm => ({
      ...a2.find(item => item.id === itm.id && item),
      ...itm,
    }))
  const geo = mergeById(gem.features, allFilter)

  return { dailyFilter, geo }
}

const parser = filePath => {
  const result = Papa.parse(filePath, {
    header: true,
  })

  return result.data
}

const DataModule = () => {
  const [appData, setAppData] = useState(null)
  const [startDate, setStartDate] = useState(null)
  const [selectedGem, setSelectedGem] = useState([])

  const { data: dailySum } = useSWR(daily, k =>
    fetch(k, { mode: 'cors' }).then(r => r.text())
  )
  const { data: history } = useSWR(table, k =>
    fetch(k, { mode: 'cors' }).then(r => r.text())
  )

  const dailySumData = useMemo(() => dailySum && parser(dailySum), [dailySum])
  const historyData = useMemo(() => history && parser(history), [history])
  const gemList = gem.features.map(x => ({
    value: x.id,
    label: x.properties.statnaam,
  }))
  const options = useMemo(() => appData && appData.dailyFilter, [appData])

  useEffect(() => {
    if (!dailySumData || !historyData) {
      return
    }
    // dailySumData.data.slice(-1)[0]
    setAppData(filterData(dailySumData, historyData, startDate))
  }, [dailySumData, historyData, startDate])
  console.log(selectedGem)
  const handleKeyChange = a => {
    // const copy = []
    // if (a) {
    //   a.forEach(x => {
    //     const res = appData.geo.filter(z => z.id === x.value)
    //     copy.push(...res)
    //   })
    // }
    setSelectedGem(a)
  }

  if (!appData) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div className='grid'>
        <MapComponent
          appData={appData}
          selectedGem={selectedGem}
        ></MapComponent>

        <div className='text-container'>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            placeholderText='This only includes today and tomorrow'
            minDate={options.min}
            maxDate={options.max}
          />
          <Select
            placeholder='Municipality'
            isMulti
            options={gemList}
            className='basic-multi-select'
            classNamePrefix='select'
            onChange={handleKeyChange}
            clearValue={() => setSelectedGem([])}
          />
        </div>
      </div>
    </>
  )
}

export default DataModule
