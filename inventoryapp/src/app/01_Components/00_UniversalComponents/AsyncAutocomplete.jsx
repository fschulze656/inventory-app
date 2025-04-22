import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Autocomplete,
  CircularProgress,
  TextField
} from '@mui/material';

import { AlertContext } from '../../02_Providers/AlertProvider';

import { get } from '../../axiosClient';

/**
 * Custom asynchronous autocomplete component
 */
const AsyncAutocomplete = ({ dataUrl, label, sx, localAlert, optionFilter, excludeOptionFilter, ...props }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showAlert: globalAlert } = useContext(AlertContext);
  const showAlert = localAlert || globalAlert;

  const handleOpen = () => {
    setOpen(true);
    (async () => {
      try {
        setLoading(true);
        const { data } = await get(dataUrl);
        const filteredOptions = (optionFilter && optionFilter.length > 0)
          ? data.filter((dataElement) => {
            const isInOptionFilter = optionFilter.some((filterElement) => dataElement._id === filterElement._id);
            return excludeOptionFilter ? !isInOptionFilter : isInOptionFilter;
          })
          : [...data];
        setLoading(false);

        setOptions([...filteredOptions]);
      } catch (error) {
        showAlert(error.response.data);
      }
    })();
  };

  const handleClose = () => {
    setOpen(false);
    setOptions([]);
  };

  return (
    <Autocomplete
      {...props}
      sx={sx || { width: 300 }}
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      isOptionEqualToValue={(option, value) => JSON.stringify(option) === JSON.stringify(value)}
      getOptionLabel={(option) => (option.name || option.username)}
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color='inherit' size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }
          }}
        />
      )}
    />
  );
};

AsyncAutocomplete.propTypes = {
  dataUrl: PropTypes.string,
  label: PropTypes.string,
  sx: PropTypes.object,
  localAlert: PropTypes.func,
  optionFilter: PropTypes.array,
  excludeOptionFilter: PropTypes.bool
};

export default AsyncAutocomplete;
