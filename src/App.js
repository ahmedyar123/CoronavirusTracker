import {
  Card,
  FormControl,
  MenuItem,
  Select,
  CardContent,
} from "@material-ui/core";
import React, { useState, useEffect } from "react";

import InfoBox from "./components/InfoBox";
import Map from "./components/Map";
import Table from "./components/Table";
import LineGraph from "./components/LineGraph";
import { sortData, prettyPrintStat } from "./util";
import numeral from "numeral";
import "leaflet/dist/leaflet.css";
import "./App.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [mapCountries, setMapCountries] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 29.2985, lng: 42.551 });
  const [mapZoom, setMapZoom] = useState(3);
  const [casesType, setCasesType] = useState("cases");

  //useEffect = Runs a piece of code based on condition
  useEffect(() => {
    // This code run only once when the component loads
    // async = send a request, wait for it, use it
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));
          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
    };
    getCountriesData();
  }, []);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  });

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);
        console.log(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  };

  return (
    <div className="App">
      <div className="app_left">
        {/* header */}
        {/* title + select input dropdown field */}
        <div className="app_header">
          <h1>Coronavirus Tracker</h1>
          <FormControl className="app_dropdown">
            <Select
              variant="outlined"
              onChange={onCountryChange}
              value={country}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {/* loop through all the countries */}
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        {/* infoBoxs */}
        <div className="app_stats">
          <InfoBox
            onClick={(e) => setCasesType("cases")}
            isRed
            title="Coronavirus Cases"
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={countryInfo.cases}
          />
          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={countryInfo.recovered}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            isRed
            title="Deaths"
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={countryInfo.deaths}
          />
        </div>
        {/* map */}
        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app_right">
        <CardContent>
          <h3>Live Cases By Country</h3>
          {/* table */}
          <Table countries={tableData} />
          <h3>Worldwide New Cases {casesType}</h3>
          {/* graph */}
          <LineGraph casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
