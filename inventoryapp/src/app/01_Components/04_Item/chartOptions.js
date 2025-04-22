/**
 * Constructs a visual map for the stock history line chart to visualy distinguish SET updates from ADD and REMOVE
 *
 * @param {Array} history item's stock update history
 * @param {Number} lastValue length of the values array
 * @returns Visual map for the chart
 */
const createPieces = (history, lastValue) => {
  const pieces = [];
  // set starting boundary
  pieces.push({ color: 'green', gte: 0, lte: null });

  history.forEach((element, index) => {
    // set ending boundary of latest segment and starting boundary of new segment
    if (element.action === 'setQuantity') {
      pieces[pieces.length - 1].lte = index - 1;
      pieces.push({ color: 'green', gte: index, lte: null });
    }
  });

  // set ending boundary of last segment
  pieces[pieces.length - 1].lte = lastValue;

  return pieces;
};

/**
 * Constructs the option object for the stock hitory line chart
 *
 * @param {Array} history item's stock update history
 * @param {Number} currentStock item's current stock
 * @returns Option object for the line chart
 */
const getChartOption = (history, currentStock) => {
  const yrotsih = history.toReversed();
  const timestamps = [];
  const values = [currentStock];

  // because history tracks relative updates, absolute values need to be calculated
  yrotsih.forEach((element) => {
    timestamps.push(element.createdAt);

    // better visualization for only one action
    if (yrotsih.length === 1) {
      timestamps.push(element.createdAt);
      values.push(element.quantity);
    }

    if (element.action === 'updateQuantity') {
      // calculate absolute stock values
      values.push(values[values.length - 1] - element.quantity);
    } else if (element.action === 'setQuantity') {
      // "reset" stock
      values.push(element.prevStock);
    }
  });

  if (values.length !== timestamps.length) values.pop();

  timestamps.reverse();
  values.reverse();

  const option = {
    title: {
      text: 'Stock History',
      textStyle: {
        color: '#FFFFFF'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
      },
      formatter: (params) => {
        const point = params[0];
        const dataItem = history[point.dataIndex];
        const stock = values[point.dataIndex]
        return `
          <div>
            <strong>Stock:</strong> ${stock}<br />
            ${dataItem?.action ? `<strong>Action:</strong> ${dataItem.action}<br />` : ''}
            ${dataItem?.createdAt ? `<strong>Time:</strong> ${dataItem.createdAt}<br />` : ''}
            ${dataItem?.userId ? `<strong>User:</strong> ${dataItem.user[0].username}<br />` : ''}
            ${dataItem?.projectId ? `<strong>Project:</strong> ${dataItem.project[0].name}<br />` : ''}
            ${dataItem?.comment ? `<strong>Comment:</strong> ${dataItem.comment}<br />` : ''}
          </div>
        `
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timestamps,
      name: 'Time',
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: 'Stock'
    },
    toolbox: {
      right: 10,
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        }
      }
    },
    dataZoom: [{}],
    visualMap: {
      show: false,
      dimension: 0,
      pieces: createPieces(history, values.length)
    },
    series: [
      {
        data: values,
        type: 'line',
        smooth: true,
        animation: false,
        areaStyle: {}
      }
    ]
  }

  return option;
};

export default getChartOption;
