import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  Button,
  TextField
} from '@mui/material';

import { AsyncAutocomplete } from '../00_UniversalComponents';
import { changeLocation } from '../02_Navigation/navSlice';
import { AlertContext } from '../../02_Providers/AlertProvider';

import { itemUrls, projectUrls, userUrls } from '@urls';
import { post } from '../../axiosClient';

/**
 * Component used to create a project
 *
 * Name needs to be entered, items and users can be edited later
 */
const ProjectCreator = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { isMobile } = useSelector((state) => state.device);
  const { showAlert } = useContext(AlertContext);
  const [associatedItems, setAssociatedItems] = useState([]);
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [content, setContent] = useState({
    name: '',
    associatedItems: [],
    allowedUsers: []
  });

  const handleCreate = async () => {
    associatedItems.forEach((item) => {
      content.associatedItems.push(item._id);
    });
    allowedUsers.forEach((user) => {
      content.allowedUsers.push(user._id);
    });
    const { data } = await post(projectUrls.createProject, { project: content });
    history.push(`/projectDetail?id=${data}`);
  };

  useEffect(() => {
    dispatch(changeLocation('Create Project'));
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      margin: '15px',
      gap: '10px',
      width: isMobile ? '' : '40%',
      justifySelf: 'center'
    }}>
      <TextField
        label='Project Name'
        value={content.name}
        onChange={(event) => {
          setContent((prev) => ({ ...prev, name: event.target.value }));
        }}
      />
      <div style={{ display: 'flex' }}>
        <AsyncAutocomplete
          multiple
          filterSelectedOptions
          limitTags={2}
          dataUrl={itemUrls.getAllItems}
          label={'Associated Items'}
          localAlert={showAlert}
          value={associatedItems}
          sx={{ width: '100%' }}
          onChange={(event, items) => {
            if (items) setAssociatedItems(items);
          }}
        />
      </div>
      <div style={{ display: 'flex' }}>
        <AsyncAutocomplete
          multiple
          filterSelectedOptions
          limitTags={2}
          dataUrl={userUrls.getAllUsers}
          label={'Allowed Users'}
          localAlert={showAlert}
          value={allowedUsers}
          sx={{ width: '100%' }}
          onChange={(event, users) => {
            if (users) setAllowedUsers(users);
          }}
        />
      </div>
      <Button
        variant='contained'
        onClick={handleCreate}
        disabled={content.name.length === 0}
        sx={{
          backgroundColor: 'hsl(120, 100%, 35%)',
          width: isMobile ? '100%' : '30%'
        }}
      >
        Create
      </Button>
    </div>
  );
};

export default ProjectCreator;
