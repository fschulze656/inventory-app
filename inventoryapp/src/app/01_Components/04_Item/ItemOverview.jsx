import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import {
  Button,
  ButtonGroup,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import { StringParam, useQueryParam } from 'use-query-params';

import { AsyncAutocomplete } from '../00_UniversalComponents';
import { changeLocation } from '../02_Navigation/navSlice';
import { AlertContext } from '../../02_Providers/AlertProvider';
import { useWebSocket } from '../../02_Providers/WebSocketProvider';

import { itemUrls, projectUrls } from '@urls';
import { get, post } from '../../axiosClient';


/**
 * Overview page of an item that displays when the user scans a QR code of an item's `ObjectId`
 */
const ItemOverview = () => {
  const dispatch = useDispatch();
  const { showAlert } = useContext(AlertContext);
  const { websocketRef } = useWebSocket();
  const [id] = useQueryParam('id', StringParam);
  const [item, setItem] = useState(null);
  const [project, setProject] = useState(null);
  const [comment, setComment] = useState('');
  const [amount, setAmount] = useState(1);
  const [mult, setMult] = useState(1);
  const [original, setOriginal] = useState(1);
  const [lastUpdate, setLastUpdate] = useState(0);

  const handleAdd = async () => {
    if (amount <= 0) return;

    let response;
    try {
      if (item.isAssembly) response = await post(itemUrls.assembleItem, { quantity: amount }, { itemId: id });
      else response = await post(itemUrls.updateQuantity, { amount }, { itemId: id });
      showAlert(response.data, 'success');
    } catch (error) {
      showAlert(error.response.data);
    }
  };

  const handleRemove = async () => {
    if (amount <= 0) return;
    if (amount > item.inStock) return showAlert('Insufficient stock');

    try {
      const response = await post(itemUrls.updateQuantity, { amount: -amount, projectId: project._id, comment }, { itemId: id });
      showAlert(response.data, 'success');
    } catch (error) {
      showAlert(error.response.data);
    }
  };

  useEffect(() => {
    const socket = websocketRef.current;
    if (!socket) return;

    const handleMessage = (event) => {
      const payload = JSON.parse(event.data);
      const [module, action] = payload.type.split('/');

      if (module === 'item') {
        if (action === 'update') setLastUpdate(payload.data);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [websocketRef]);

  useEffect(() => {
    dispatch(changeLocation(''));
    (async () => {
      const { data } = await get(itemUrls.getItem, { itemId: id });
      setItem(data);
    })();
  }, [lastUpdate, id]);

  return (
    <>
      <Typography variant='h4' textAlign='center' margin={1}>{item?.name}</Typography>
      <Typography variant='h5' textAlign='center' margin={1}>{item?.location}</Typography>
      <Typography variant='h5' textAlign='center' margin={1}>In Stock: {item?.inStock} {item?.measurementUnit}</Typography>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'center', margin: 20 }}>
          <IconButton
            sx={{ marginRight: 1 }}
            size='large'
            disableRipple
            onClick={() => {
              if (mult === 1) return;
              setMult(mult - 1);
              setAmount(original * (mult - 1));
            }}
          >
            <RemoveIcon fontSize='inherit' />
          </IconButton>
          <ButtonGroup orientation='vertical' size='large' sx={{ gap: 2 }}>
            <Button
              variant='contained'
              onClick={handleAdd}
            >
              Add
            </Button>
            <ToggleButtonGroup
              value={amount}
              exclusive
              sx={{ borderRadius: 0 }}
              size='large'
              onChange={(event, newAmount) => {
                if (newAmount !== null) setAmount(newAmount);
              }}
            >
              <ToggleButton
                value={amount >= 1 && amount < 10 ? 1 * mult : 1}
                sx={{ borderRadius: 0 }}
                onClick={() => {
                  setMult(1);
                  setOriginal(1);
                  setAmount(1);
                }}
              >
                {amount >= 1 && amount < 10 ? 1 * mult : 1}
              </ToggleButton>
              <ToggleButton
                value={amount >= 10 && amount < 100 ? 10 * mult : 10}
                onClick={() => {
                  setMult(1);
                  setOriginal(10);
                  setAmount(10);
                }}
              >
                {amount >= 10 && amount < 100 ? 10 * mult : 10}
              </ToggleButton>
              <ToggleButton
                value={amount >= 100 ? 100 * mult : 100}
                sx={{ borderRadius: 0 }}
                onClick={() => {
                  setMult(1);
                  setOriginal(100);
                  setAmount(100);
                }}
              >
                {amount >= 100 ? 100 * mult : 100}
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant='contained'
              disabled={!comment || !project}
              onClick={handleRemove}
            >
              Remove
            </Button>
          </ButtonGroup>
          <IconButton
            sx={{ marginLeft: 1 }}
            size='large'
            disableRipple
            onClick={() => {
              if (mult === 9) return;
              setMult(mult + 1);
              setAmount(original * (mult + 1));
            }}
          >
            <AddIcon fontSize='inherit' />
          </IconButton>
        </div>
        <TextField
          label='Comment'
          multiline
          rows={4}
          sx={{ width: 300 }}
          onChange={(event) => setComment(event.target.value)}
        />
        <AsyncAutocomplete
          dataUrl={projectUrls.getAllProjects}
          label={'Project'}
          value={project}
          onChange={(_, newProject) => {
            if (newProject) setProject(newProject);
            else setProject(null);
          }}
        />
        <Link to={`/itemDetail?id=${item?._id}`}>
          <Button>
            Details
          </Button>
        </Link>
      </div>
    </>
  );
};

export default ItemOverview;
