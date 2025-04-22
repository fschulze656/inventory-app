import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import {
  Box,
  Button,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { changeLocation } from '../02_Navigation/navSlice';

import { categoryUrls } from '@urls';
import { get } from '../../axiosClient';

/**
 * Custom collapsible table row component
 */
const Row = ({ row, isMobile }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell sx={{ width: '50px' }}>
          <IconButton
            size='small'
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.name}</TableCell>
        <TableCell align='right'>{row.properties.length}</TableCell>
        <TableCell align='right'>{row.items.length}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              margin: 1,
              gap: 5
            }}>
              <Box sx={{ width: isMobile ? '100%' : '50%' }}>
                <Typography variant='h6' gutterBottom component='div'>
                  Properties
                </Typography>
                <Table stickyHeader size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell align='right'>Unit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.properties.map((prop, index) => (
                      <TableRow key={index}>
                        <TableCell component='th' scope='row'>{prop.name}</TableCell>
                        <TableCell align='right'>{prop.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              <Box sx={{ width: isMobile ? '100%' : '50%' }}>
                <Typography variant='h6' gutterBottom component='div'>
                  Items
                </Typography>
                <Table stickyHeader size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align='right'>Stock</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell component='th' scope='row'>
                          <Link to={`/itemDetail?id=${item._id}`} style={{ color: 'white' }}>
                            {item.name}
                          </Link>
                        </TableCell>
                        <TableCell align='right'>{item.inStock}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

Row.propTypes = {
  row: PropTypes.shape({
    name: PropTypes.string,
    properties: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      unit: PropTypes.string
    })),
    items: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      inStock: PropTypes.number
    }))
  }),
  isMobile: PropTypes.bool
};

/**
 * List of all categories
 */
const Categories = () => {
  const dispatch = useDispatch();
  const { isMobile } = useSelector((state) => state.device);
  const [categories, setCategories] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    dispatch(changeLocation('Categories'));
    (async () => {
      const { data } = await get(categoryUrls.getAllCategories);
      setCategories(data);
      setSearchResult(data);
    })();
  }, []);

  useEffect(() => {
    setSearchResult(categories.filter((category) => {
      return category.name.toString().toLowerCase().includes(searchFilter.toString().toLowerCase());
    }))
  }, [searchFilter])

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: 10 }}>
        <TextField
          label='Search'
          size='small'
          onChange={(event) => setSearchFilter(event.target.value)}
        />
        <Link to='/createCategory'>
          <Button
            variant='contained'
            disableElevation
            startIcon={<AddIcon />}
          >
            {isMobile ? 'Category' : 'Create Category'}
          </Button>
        </Link>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Name</TableCell>
              <TableCell align='right'>Props</TableCell>
              <TableCell align='right'>Items</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {searchResult.map((category, index) => (
              <Row key={index} row={category} isMobile={isMobile} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default Categories;
