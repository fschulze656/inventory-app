import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';

import { changeLocation } from '../02_Navigation/navSlice';

import { projectUrls } from '@urls';
import { get } from '../../axiosClient';

/**
 * List of all projects
 */
const Projects = () => {
  const dispatch = useDispatch();
  const { isMobile } = useSelector((state) => state.device);
  const [projects, setProjects] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    dispatch(changeLocation('Projects'));
    (async () => {
      const { data } = await get(projectUrls.getAllProjects);
      setProjects(data);
      setSearchResult(data);
    })();
  }, []);

  useEffect(() => {
    setSearchResult(projects.filter((project) => {
      return project.name.toString().toLowerCase().includes(searchFilter.toString().toLowerCase());
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
        <Link to='/createProject'>
          <Button
            variant='contained'
            disableElevation
            startIcon={<AddIcon />}
          >
            {isMobile ? 'Project' : 'Create Project'}
          </Button>
        </Link>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell width={150} align='right'>Items</TableCell>
              <TableCell width={150} align='right'>Users</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {searchResult.map((project, index) => (
              <TableRow key={index}>
                <TableCell>{project.name}</TableCell>
                <TableCell width={150} align='right'>{project.associatedItems.length}</TableCell>
                <TableCell width={150} align='right'>{project.allowedUsers.length}</TableCell>
                <TableCell width={100} align='right'>
                  <Link
                    to={`/projectDetail?id=${project._id}`}
                  >
                    <IconButton>
                      <ManageSearchIcon />
                    </IconButton>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default Projects;
