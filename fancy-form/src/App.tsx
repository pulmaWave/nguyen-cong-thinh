import React, { useEffect, useState } from 'react'
import './App.css'
import { Input } from './components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import _ from 'lodash'

const swapIc = <svg aria-hidden="true" focusable="false" role="none" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="m16.629 11.999-1.2-1.2 3.085-3.086H2.572V5.999h15.942L15.43 2.913l1.2-1.2 4.543 4.543a.829.829 0 0 1 0 1.2l-4.543 4.543Zm-9.257-.001 1.2 1.2-3.086 3.086h15.943v1.714H5.486l3.086 3.086-1.2 1.2-4.543-4.543a.829.829 0 0 1 0-1.2l4.543-4.543Z" clip-rule="evenodd"></path></svg>

interface Price {
  "currency": string;
  "date": string;
  "price": number
}

const DEFAULT_AMOUNT_CURRENCY = "ETH"
const DEFAULT_CONVERTED_CURRENCY = "BUSD"

function App() {

  const [data, setData] = useState<Price[]>([])
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState(null);

  // input
  const [amountValue, setAmountValue] = useState<number | string>(1)
  const [convertedValue, setConvertedValue] = useState<number | string>()

  // select
  const [amountPriceUnit, setAmountPriceUnit] = useState<number>(0)
  const [convertedPriceUnit, setConvertedPriceUnit] = useState<number>(0)

  // handle input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amountValue = Number(e.target.value);
    setAmountValue(amountValue)
    const amount = Number(amountValue * amountPriceUnit / convertedPriceUnit).toFixed(2)
    setConvertedValue(amount)
  }

  const handleConvertedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const convertedValue = Number(e.target.value);
    setConvertedValue(convertedValue)
    const amount = Number(convertedValue * convertedPriceUnit / amountPriceUnit).toFixed(2)
    setAmountValue(amount)
  }


  // handle select change
  const handleAmountCurrencyChange = (e: string, inputData?: Price[]) => {
    const currencyData = inputData || data
    const item = currencyData.find(v => v.currency === e)
    const convertedPriceUnitCurrent = currencyData.find(v => v.currency === DEFAULT_CONVERTED_CURRENCY)
    if (!item || !convertedPriceUnitCurrent)
      return
    setAmountPriceUnit(item.price)
    const value = Number(Number(amountValue) * item.price / (convertedPriceUnit || convertedPriceUnitCurrent?.price)).toFixed(2)
    setConvertedValue(value)
  }

  const handleConvertedCurrencyChange = (e: string, inputData?: Price[]) => {
    const currencyData = inputData || data
    const item = currencyData.find(v => v.currency === e)
    const amountPriceUnitCurrent = currencyData.find(v => v.currency === DEFAULT_AMOUNT_CURRENCY)
    if (!item || !amountPriceUnitCurrent)
      return
    setConvertedPriceUnit(item.price)
    const value = Number(Number(amountValue) * (amountPriceUnit || amountPriceUnitCurrent?.price) / item.price).toFixed(2)
    setConvertedValue(value)
  }

  useEffect(() => {
    fetch("https://interview.switcheo.com/prices.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const uniqData = _.uniqBy(data, ((v: Price) => v.currency))
        setData(uniqData);
        setLoading(false);
        handleAmountCurrencyChange(DEFAULT_AMOUNT_CURRENCY, uniqData)
        handleConvertedCurrencyChange(DEFAULT_CONVERTED_CURRENCY, uniqData)

      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className=''>
      <div className='md:flex md:items-end'>
        <div>
          <label htmlFor="amount">Amount</label>
          <div className='flex gap-2'>
            <Input type='number' id='amount' onChange={handleAmountChange} value={amountValue}
              className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <Select defaultValue={DEFAULT_AMOUNT_CURRENCY} onValueChange={handleAmountCurrencyChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {data && data.map((item) =>
                    <SelectItem key={item.currency} value={item.currency}>
                      <div className='flex gap-2'>
                        <img src={`/assets/tokens/${item.currency}.svg`} alt={`${item.currency}-svg`} className='w-5 h-5' />
                        {item.currency}
                      </div>
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='flex m-2'>{swapIc}</div>
        <div>
          <label htmlFor="converted">Converted to</label>
          <div className='flex gap-2'>
            <Input type='number' id='converted' onChange={handleConvertedChange} value={convertedValue}
              className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <Select defaultValue={DEFAULT_CONVERTED_CURRENCY} onValueChange={handleConvertedCurrencyChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {data && data.map((item) =>
                    <SelectItem key={item.currency} value={item.currency}>
                      <div className='flex gap-2 items-center'>
                        <img src={`/assets/tokens/${item.currency}.svg`} alt={`${item.currency}-svg`} className='w-5 h-5' />
                        {item.currency}
                      </div>
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div>
        Rate: Amount 1 Convert to {Number(amountPriceUnit) / convertedPriceUnit}
      </div>
    </div >
  )
}

export default App
