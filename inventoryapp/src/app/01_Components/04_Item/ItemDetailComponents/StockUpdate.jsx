import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import {
  Button,
  TextField,
} from '@mui/material';

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import { AsyncAutocomplete } from '../../00_UniversalComponents';
import { AlertContext } from '../../../02_Providers/AlertProvider';

import { itemUrls, projectUrls } from '@urls';
import { post } from '../../../axiosClient';

import '../styles/ItemDetail.css';

/**
 * Used to update the stock on an item
 *
 * - ADD: adds `amount` to the current stock
 *   - automatically updates stock of all items in the BOM if present
 * - REMOVE: subtracts `amount` from the current stock
 *   - removal reason and associated project need to be specified
 * - SET: replaces the current stock with `amount`
 *   - correction reason needs to be specified
 *
 * The insert date of all actions can be adjusted
 */
const StockUpdate = ({ item, amount, setAmount }) => {
  const { isMobile } = useSelector((state) => state.device);
  const { showAlert } = useContext(AlertContext);
  const [comment, setComment] = useState('');
  const [date, setDate] = useState(null);
  const [project, setProject] = useState(null);
  const [showDate, setShowDate] = useState(false);

  const handleAdd = async () => {
    if (amount <= 0) return;

    let response;
    try {
      if (item.isAssembly) response = await post(itemUrls.assembleItem, { quantity: amount, time: date?.$d }, { itemId: item._id });
      else response = await post(itemUrls.updateQuantity, { amount, time: date?.$d }, { itemId: item._id });
      showAlert(response.data, 'success');
    } catch (error) {
      showAlert(error.response.data);
    }
  };

  const handleRemove = async () => {
    if (amount <= 0) return;
    if (amount > item.inStock) return showAlert('Insufficient stock');

    try {
      const response = await post(itemUrls.updateQuantity, { amount: -amount, projectId: project._id, comment, time: date?.$d }, { itemId: item._id });
      showAlert(response.data, 'success');
    } catch (error) {
      showAlert(error.response.data);
    }
  };

  const handleSet = async () => {
    if (!amount) return;

    try {
      const response = await post(itemUrls.setQuantity, { newAmount: amount, comment, time: date?.$d }, { itemId: item._id });
      showAlert(response.data, 'success');
    } catch (error) {
      showAlert(error.response.data);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'center',
      gap: 15
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        width: 150
      }}>
        <Button
          variant='contained'
          sx={{ width: 150 }}
          onClick={handleAdd}
        >
          Add
        </Button>
        <TextField
          label='Amount'
          type='number'
          slotProps={{
            htmlInput: {
              min: 0
            }
          }}
          value={amount}
          sx={{ width: 150, marginLeft: 5, marginRight: 5 }}
          onChange={(event) => {
            setAmount(event.target.value < 0 ? 0 : event.target.value)
          }}
        />
        <Button
          variant='contained'
          disabled={!comment || !project}
          sx={{ width: 150 }}
          onClick={handleRemove}
        >
          Remove
        </Button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
        <TextField
          label='Comment'
          size='small'
          sx={{ width: 300 }}
          onChange={(event) => setComment(event.target.value)}
        />
        <AsyncAutocomplete
          dataUrl={projectUrls.getAllProjects}
          label={'Project'}
          size='small'
          value={project}
          sx={{ width: 300 }}
          optionFilter={item.associatedProjects}
          onChange={(_, newProject) => {
            if (newProject) setProject(newProject);
            else setProject(null);
          }}
        />
        {showDate
          ? <div style={{
            display: 'flex',
            width: 300,
            gap: 5
          }}>
            <DateTimePicker
              label='Date'
              format='YYYY/MM/DD HH:mm'
              timezone='UTC'
              viewRenderers={isMobile
                ? {}
                : {
                  hours: null,
                  minutes: null,
                  seconds: null,
                }
              }
              onChange={(newTime) => {
                setDate(newTime);
              }}
            />
            <Button onClick={() => {
              setShowDate(false);
              setDate(null);
            }}>
              Cancel
            </Button>
          </div>
          : <Button onClick={() => setShowDate(true)}>
            Adjust Insert Date
          </Button>}
      </div>
      <div style={{ alignContent: 'center' }}>
        <Button
          variant='contained'
          size='small'
          disabled={!comment}
          sx={{ width: '100px', fontSize: '11px' }}
          onClick={handleSet}
        >
          Set Stock To Amount
        </Button>
      </div>
    </div>
  );
};

StockUpdate.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string,
    isAssembly: PropTypes.bool,
    inStock: PropTypes.number,
    associatedProjects: PropTypes.array,
  }),
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setAmount: PropTypes.func,
};

export default StockUpdate;
