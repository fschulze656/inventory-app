import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { StringParam, useQueryParam } from 'use-query-params';

import { AsyncAutocomplete } from '../00_UniversalComponents';
import { changeLocation } from '../02_Navigation/navSlice';
import { useWebSocket } from '../../02_Providers/WebSocketProvider';

import { itemUrls, userUrls, projectUrls } from '@urls';
import { get, post } from '../../axiosClient';

/**
 * Overview of a project where the user can add and remove items and users
 */
const ProjectDetail = () => {
  const dispatch = useDispatch();
  const { websocketRef } = useWebSocket();
  const { isMobile } = useSelector((state) => state.device);
  const [id] = useQueryParam('id', StringParam);
  const [project, setProject] = useState(null);
  const [item, setItem] = useState(null);
  const [user, setUser] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(0);

  const handleAddItem = async () => {
    await post(projectUrls.updateProject, { id: item._id, type: 'associatedItems', action: '$push' }, { projectId: id });
    setItem(null);
  };

  const handleAddUser = async () => {
    await post(projectUrls.updateProject, { id: user._id, type: 'allowedUsers', action: '$push' }, { projectId: id });
    setUser(null);
  };

  const handleRemoveItem = async (itemId) => {
    await post(projectUrls.updateProject, { id: itemId, type: 'associatedItems', action: '$pull' }, { projectId: id });
  };

  const handleRemoveUser = async (userId) => {
    await post(projectUrls.updateProject, { id: userId, type: 'allowedUsers', action: '$pull' }, { projectId: id });
  };

  useEffect(() => {
    const socket = websocketRef.current;
    if (!socket) return;

    const handleMessage = (event) => {
      const payload = JSON.parse(event.data);
      const [module, action] = payload.type.split('/');

      if (module === 'project') {
        if (action === 'update') setLastUpdate(payload.data);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [websocketRef]);

  useEffect(() => {
    (async () => {
      const { data } = await get(projectUrls.getProject, { projectId: id });
      setProject(data);
      dispatch(changeLocation(data.name));
    })();
  }, [lastUpdate]);

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '5px',
        justifyContent: 'space-between',
        margin: '10px',
        height: isMobile ? 'fit-content' : '91vh'
      }}>
        <Paper sx={{
          height: isMobile ? 'fit-content' : '100%',
          width: isMobile ? '100%' : '50%',
          padding: '10px'
        }}>
          <TableContainer sx={{ height: '100%' }}>
            <Table stickyHeader>
              <TableHead sx={{ backgroundColor: 'gray' }}>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <AsyncAutocomplete
                      dataUrl={itemUrls.getAllItems}
                      value={item}
                      optionFilter={project?.associatedItems}
                      excludeOptionFilter={true}
                      size='small'
                      sx={{ width: isMobile ? '40vw' : 300 }}
                      onChange={(_, newItem) => {
                        if (newItem) setItem(newItem);
                        else setItem(null);
                      }}
                    />
                  </TableCell>
                  <TableCell align='right'>
                    <Button
                      variant='contained'
                      startIcon={<AddIcon />}
                      disabled={!item}
                      onClick={handleAddItem}
                    >
                      Add Item
                    </Button>
                  </TableCell>
                </TableRow>
                {project?.associatedItems?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align='right'>
                      <IconButton
                        onClick={() => handleRemoveItem(item._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        <Paper sx={{
          height: isMobile ? 'fit-content' : '100%',
          width: isMobile ? '100%' : '50%',
          padding: '10px'
        }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <AsyncAutocomplete
                      dataUrl={userUrls.getAllUsers}
                      value={user}
                      optionFilter={project?.allowedUsers}
                      excludeOptionFilter={true}
                      size='small'
                      sx={{ width: isMobile ? '40vw' : 300 }}
                      onChange={(_, newUser) => {
                        if (newUser) setUser(newUser);
                        else setUser(null);
                      }}
                    />
                  </TableCell>
                  <TableCell align='right'>
                    <Button
                      variant='contained'
                      startIcon={<AddIcon />}
                      disabled={!user}
                      onClick={handleAddUser}
                    >
                      Add User
                    </Button>
                  </TableCell>
                </TableRow>
                {project?.allowedUsers?.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell align='right'>
                      <IconButton
                        onClick={() => handleRemoveUser(user._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div >
    </>
  );
};

export default ProjectDetail;
