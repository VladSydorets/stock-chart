import { useState, useEffect, useMemo } from "react";
import "./App.css";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Stock {
  name: string;
  price: number;
  time: string;
}

function App() {
  const [stock, setStock] = useState<Stock>({
    name: "",
    price: 0,
    time: "",
  });
  const [stockArr, setStockArr] = useState<Stock[]>([
    {
      name: "",
      price: 0,
      time: "",
    },
    {
      name: "",
      price: 0,
      time: "",
    },
  ]);
  const [stockName, setStockName] = useState<string>("");
  const [previousPrice, setPreviousPrice] = useState<number>(0);

  const [loading, setLoading] = useState<Boolean>(false);

  const stocksUrl = `https://yahoo-finance-api.vercel.app/${stockName}`;
  async function getStocks() {
    const response = await fetch(stocksUrl);
    return response.json();
  }

  useEffect(() => {
    let timeoutId: number;
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getStocks();

        const price = data.chart.result[0].meta.regularMarketPrice;
        const time = new Date(
          data.chart.result[0].meta.regularMarketTime * 1000
        ).toLocaleTimeString();

        setPreviousPrice(stock.price);

        // updateArr();

        setStock({
          name: stockName,
          price: price.toFixed(2),
          time: time,
        });
      } catch (error: any) {}

      timeoutId = setTimeout(fetchData, 5000 * 2);
      setLoading(false);
    };

    fetchData();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [stockName]);

  function updateArr() {
    const newArr = [...stockArr, stock];
    setStockArr(newArr);
  }

  useEffect(() => {
    updateArr();
  }, [stock]);

  const textColor = useMemo(
    () =>
      stockArr[stockArr.length - 2].price < stock.price
        ? "green"
        : stockArr[stockArr.length - 2].price > stock.price
        ? "red"
        : "",
    [stockArr, stock.price]
  );

  const difference = useMemo(
    () =>
      stockArr[stockArr.length - 1].price - stockArr[stockArr.length - 2].price,
    [stockArr, stock.price]
  );

  function handleStockNameChange(event: SelectChangeEvent) {
    setStockName(event.target.value);
  }

  // new Chart()
  const chart = {
    options: {
      chart: {
        type: "candlestick",
        height: 350,
      },
      title: {
        text: "CandleStick Chart",
        align: "left",
      },
      xaxis: {
        type: "datetime",
      },
      yaxis: {
        tooltip: {
          enabled: true,
        },
      },
    },
  };

  const labels = stockArr.map((stock) => stock.time);
  const prices = stockArr.map((stock) => stock.price);
  const data = {
    labels,
    datasets: [
      {
        label: `${stockName} stock`,
        data: prices,
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",

        pointBorderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
      },
    ],
  };

  if (loading) {
    return <p>Loading...</p>;
  }
  // if (error) {
  //   return <p>An error has occured: {error}</p>;
  // }
  return (
    <div className="App">
      <div className="stock-container">
        <FormControl className="stock-select">
          <InputLabel id="demo-simple-select-label" sx={{ color: "white" }}>
            Stock
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={stockName}
            label="Age"
            onChange={handleStockNameChange}
            sx={{
              borderColor: "white",
              fontSize: "1rem",
              width: "15rem",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(228, 219, 233, 0.25)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(228, 219, 233, 0.25)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(228, 219, 233, 0.25)",
              },
              ".MuiSvgIcon-root ": {
                fill: "white !important",
              },
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value={"AAPL"}>Apple</MenuItem>
            <MenuItem value={"MSFT"}>Microsoft</MenuItem>
            <MenuItem value={"GOOGL"}>Alphabet</MenuItem>
            <MenuItem value={"TSLA"}>Tesla</MenuItem>
            <MenuItem value={"NFLX"}>Netflix</MenuItem>
          </Select>
        </FormControl>

        <p className={`price ${textColor}`}>
          <span className="difference">{`(${(
            stockArr[stockArr.length - 1].price -
            stockArr[stockArr.length - 2].price
          ).toFixed(2)})`}</span>
          {` $${stock.price}`}
        </p>
        <p className="time">{stock !== null && `${stock.time}`}</p>
      </div>
      <div className="line-container">
        <Line data={data} height={125} />
        {/* <Chart options={chart.options} type="candlestick" width="100%" height={320}/> */}
      </div>
    </div>
  );
}

export default App;
