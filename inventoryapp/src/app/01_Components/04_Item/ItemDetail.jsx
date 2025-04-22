import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import ReactECharts from 'echarts-for-react';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';

import {
  Button,
  Dialog,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import { StringParam, useQueryParam } from 'use-query-params';

import StockUpdate from './ItemDetailComponents/StockUpdate';
import ItemInfo from './ItemDetailComponents/ItemInfo';
import { changeLocation } from '../02_Navigation/navSlice';
import { useWebSocket } from '../../02_Providers/WebSocketProvider';

import { itemUrls } from '@urls';
import { get } from '../../axiosClient';
import getChartOption from './chartOptions';

import './styles/ItemDetail.css';

/**
 * Detail page of an item where the user can update the stock, upload an image, get the `ObjectId` QR code
 * and see the details and stock chart
 */
const ItemDetail = () => {
  const dispatch = useDispatch();
  const { websocketRef } = useWebSocket();
  const [id] = useQueryParam('id', StringParam);
  const [item, setItem] = useState({});
  const [option, setOption] = useState({});
  const [itemHistory, setItemHistory] = useState([]);
  const [amount, setAmount] = useState(0);
  const [itemUpdate, setItemUpdate] = useState(0);
  const [projectUpdate, setProjectUpdate] = useState(0);
  const [entries, setEntries] = useState(50);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const contentRef = useRef();
  const handlePrint = useReactToPrint({ contentRef });

  useEffect(() => {
    const socket = websocketRef.current;
    if (!socket) return;

    const handleMessage = (event) => {
      const payload = JSON.parse(event.data);
      const [module, action] = payload.type.split('/');

      if (module === 'item') {
        if (action === 'update') setItemUpdate(payload.data);
      }

      if (module === 'project') {
        if (action === 'update') setProjectUpdate(payload.data);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [websocketRef]);

  useEffect(() => {
    (async () => {
      const { data } = await get(itemUrls.getItem, { itemId: id });
      setItem(data);
      dispatch(changeLocation(data.name));
    })();
  }, [itemUpdate, projectUpdate, id]);

  useEffect(() => {
    (async () => {
      if (item) {
        const { data } = await get(itemUrls.getItemHistory, { itemId: id, entries });
        setOption(getChartOption(data, item.inStock));
        setItemHistory(data);
      }
    })();
  }, [item, id, entries]);

  return (
    <>
      <div className='detail-page'>
        <div className='item-detail'>
          <StockUpdate item={item} amount={amount} setAmount={setAmount} />
          <ItemInfo item={item} itemUpdate={itemUpdate} amount={amount} setShowQRCode={setShowQRCode} />
        </div>
        <div className='stock-graph'>
          <Paper sx={{ height: '100%' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              padding: 10,
              gap: 10
            }}>
              <ToggleButtonGroup
                value={entries}
                exclusive
                size='small'
                sx={{ alignSelf: 'center' }}
                onChange={(event, newValue) => {
                  if (newValue !== null) setEntries(newValue)
                }}
              >
                <ToggleButton value={50}>
                  Last 50
                </ToggleButton>
                <ToggleButton value={100}>
                  Last 100
                </ToggleButton>
                <ToggleButton value={250}>
                  Last 250
                </ToggleButton>
                <ToggleButton value={0}>
                  Entire History
                </ToggleButton>
              </ToggleButtonGroup>
              {showGraph
                ? <ReactECharts
                  option={option}
                  style={{ height: '100%' }}
                />
                : <TableContainer sx={{ height: '100%' }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Action</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Project</TableCell>
                        <TableCell>Comment</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {itemHistory.toReversed().map((element, index) => (
                        <TableRow key={index}>
                          <TableCell>{element.action}</TableCell>
                          <TableCell>{element.quantity}</TableCell>
                          <TableCell>{element.createdAt}</TableCell>
                          <TableCell>{element?.user[0]?.username}</TableCell>
                          <TableCell>{element?.project[0]?.name}</TableCell>
                          <TableCell>{element.comment}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>}
              <Button
                onClick={() => setShowGraph(!showGraph)}
              >
                Toggle Stock Graph
              </Button>
            </div>
          </Paper>
        </div>
      </div>
      <Dialog
        open={showQRCode}
        onClose={() => setShowQRCode(false)}
      >
        <div ref={contentRef} className='qr-code-container'>
          <QRCodeSVG value={id} size={128} />
          <p>{item.name}</p>
        </div>
        <Button
          variant='contained'
          sx={{ borderRadius: 0 }}
          onClick={() => handlePrint()}
        >
          Print
        </Button>
      </Dialog>
    </>
  );
};

export default ItemDetail;
