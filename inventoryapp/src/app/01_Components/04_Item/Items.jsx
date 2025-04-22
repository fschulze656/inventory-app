import React, { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import {
  Box,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import SearchIcon from '@mui/icons-material/Search';

import ItemCard from './ItemCard';
import { AsyncAutocomplete } from '../00_UniversalComponents';
import { changeLocation } from '../02_Navigation/navSlice';
import { AlertContext } from '../../02_Providers/AlertProvider';

import { itemUrls, categoryUrls } from '@urls';
import { get } from '../../axiosClient';

import './styles/Items.css'

const searchOptions = [
  {
    value: '_id',
    label: 'ID'
  },
  {
    value: 'name',
    label: 'Name'
  }
]

/**
 * Overview of all items in a tile format with the ability to search by name and id and filter by category
 */
const Items = () => {
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});
  const [search, setSearch] = useState({});
  const [filterResult, setFilterResult] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [searchOption, setSearchOption] = useState('name');
  const { showAlert } = useContext(AlertContext);

  useEffect(() => {
    dispatch(changeLocation('Items'));
    (async () => {
      try {
        setLoading(true);
        const { data } = await get(itemUrls.getAllItems);
        setLoading(false);
        setItems(data);
        setFilterResult(data);
        setSearchResult(data);
      } catch (error) {
        showAlert(error.response.data);
      }
    })();
  }, []);

  useEffect(() => {
    setFilterResult(items.filter((item) => Object.keys(filter).every((key) => {
      if (!filter[key]) return true;
      switch (key) {
        case 'category':
          return item[key] === filter[key]._id;
        default:
          return;
      }
    })));
  }, [filter])

  useEffect(() => {
    setSearchResult(filterResult.filter((item) => Object.keys(search).every((key) => {
      if (!search[key]) return true;
      switch (key) {
        case 'name':
        case '_id':
          return item[key].toString().toLowerCase().includes(search[key].toString().toLowerCase());
        default:
          return;
      }
    })));
  }, [filterResult, search]);

  return (
    <>
      <Paper className='item-search'>
        <div style={{ display: 'flex', gap: 10 }}>
          <Box sx={{ width: 100 }}>
            <FormControl fullWidth>
              <InputLabel>Search By</InputLabel>
              <Select
                value={searchOption}
                label='Search By'
                size='small'
                onChange={(event) => setSearchOption(event.target.value)}
              >
                {searchOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <TextField
            size='small'
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <SearchIcon />
                  </InputAdornment>
                )
              }
            }}
            onChange={(event) => setSearch({ [searchOption]: event.target.value })}
          />
        </div>
        <AsyncAutocomplete
          dataUrl={categoryUrls.getAllCategories}
          label='Filter by Category'
          size='small'
          onChange={(event, category) => setFilter(
            (prevFilter) => ({ ...prevFilter, category })
          )}
        />
      </Paper>
      <div className='space' />
      {loading
        ? <CircularProgress />
        : <Grid container spacing={2} padding={1}>
          {searchResult.map((item, key) => (
            <Grid key={key} size={{ xs: 12, sm: 6, md: 3, lg: 2 }}>
              <ItemCard
                key={key}
                itemId={item._id}
                itemName={item.name}
                inStock={item.inStock}
                image={item.productImage}
              />
            </Grid>
          ))}
        </Grid>}
    </>
  );
};

export default Items;
