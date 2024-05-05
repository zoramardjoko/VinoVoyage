import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import WineCard from '../components/WineCard';
import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');

export default function WineSearchPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [selectedWine, setSelectedWine] = useState(null);

  const [title, setTitle] = useState('');
  const [points, setPoints] = useState([0,100]);
  const [price, setPrice] = useState([0, 2020]);
  const [description, setDescription] = useState('');


  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/search_wines`)
      .then(res => res.json())
      .then(resJson => {
        const songsWithId = resJson.map((song) => ({ id: song.song_id, ...song }));
        setData(songsWithId);
      });
  }, []);

  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/search_wines?title=${title}` +
      `&price_lower_bound=${price[0]}&price_upper_bound=${price[1]}` +
      `&points_lower_bound=${points[0]}&points_upper_bound=${points[1]}` + `&description=${description}`
    )
      .then(res => res.json())
      .then(resJson => {
        const songsWithId = resJson.map((song) => {
          return { id: song.song_id, ...song };
        });
        setData(songsWithId);
      });
  }

  // This defines the columns of the table of songs used by the DataGrid component.
  // The format of the columns array and the DataGrid component itself is very similar to our
  // LazyTable component. The big difference is we provide all data to the DataGrid component
  // instead of loading only the data we need (which is necessary in order to be able to sort by column)
  const columns = [
    { field: 'title', headerName: 'Title', width: 850, renderCell: (params) => (
        <Link onClick={() => setSelectedWine(params.row.title)}>{params.value}</Link>
    ) },
    { field: 'description', headerName: 'Description', width: 500},
    { field: 'price', headerName: 'Price' },
    { field: 'points', headerName: 'Points' },
  ]

  return (
    <Container>
      {selectedWine && <WineCard songId={selectedWine} handleClose={() => setSelectedWine(null)} />}
      <h2>Search Wines</h2>
      <Grid container spacing={6}>
        <Grid item xs={6}>
          <TextField label='Title' value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        <Grid item xs={6}>
          <TextField label='Description' value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        <Grid item xs={6}>
          <p>Price</p>
          <Slider
            value={price}
            min={0}
            max={2020}
            step={10}
            onChange={(e, newValue) => setPrice(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={6}>
          <p>Points</p>
          <Slider
            value={points}
            min={80}
            max={100}
            step={1}
            onChange={(e, newValue) => setPoints(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
      </Grid>
      <Button onClick={() => search() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
        Search
      </Button>
      <h2>Results</h2>
      <DataGrid
        rows={data}
        columns={columns}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
        getRowId={(row) => row.song_id || row.title}
      />
    </Container>
  );
}