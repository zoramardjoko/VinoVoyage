import { useEffect, useState } from 'react';
import { Container, Paper, Grid, Typography, Link } from '@mui/material';
import WineCard from '../components/WineCard';
// import CSS page
import './CSS/App.css';

// import config file
const config = require('../config.json');


export default function HomePage() {
  // We use the setState hook to persist information across renders (such as the result of our API calls)
  const [wineOfTheDay, setWineOfTheDay] = useState({});
  const [wines, setWines] = useState([]);
  const [selectedWineTitle, setSelectedWineTitle] = useState(null);

  useEffect(() => {
    // Fetch request to get the song of the day. Fetch runs asynchronously.
    // The .then() method is called when the fetch request is complete
    // and proceeds to convert the result to a JSON which is finally placed in state.
    fetch(`http://${config.server_host}:${config.server_port}/random`)
      .then(res => res.json())
      .then(resJson => setWineOfTheDay(resJson));

  }, []);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/top_wines`)
      .then(res => res.json())
      .then(resJson => {
        setWines(resJson);
      });
  }, []);




  return (
    <Container>
      {selectedWineTitle && <WineCard songId={selectedWineTitle} handleClose={() => setSelectedWineTitle(null)} />}
      <h2>Wine of The Day:&nbsp;
        <Link onClick={() => setSelectedWineTitle(wineOfTheDay.title)}>{wineOfTheDay.title}</Link>
      </h2>
      <div className="masonry-grid">
        {wines.map((wine) => (
          <div className="card" key={wine.title} onClick={() => setSelectedWineTitle(wine.title)}>
            <Paper elevation={3} className="card-content">
              <Typography variant="h6">{wine.title}</Typography>
              <Typography variant="body1">Price: ${wine.price}</Typography>
              <Typography variant="body1">Points: {wine.points}</Typography>
            </Paper>
          </div>
        ))}
      </div>
    </Container>
  );
};
