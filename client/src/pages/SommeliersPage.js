import { useEffect, useState } from 'react';
import { Container,Link } from '@mui/material';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';



const config = require('../config.json');

export default function SommeliersPage() {
  const [sommeliers, setSommeliers] = useState([]);

  useEffect(() => {
    fetch(`https://vino-voyage-server.vercel.app/sommeliers`)
      .then(res => res.json())
      .then(resJson => {
        setSommeliers(resJson);
      });
        }, []);

  return (
    <Container>
      <h2>Top Sommeliers</h2>
      <TableContainer component={Paper}>
        <Table aria-label="sommelier table">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell> {/* Added column for numbering */}
              <TableCell>Sommelier</TableCell>
              <TableCell>Wines Reviewed</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sommeliers.map((sommelier, index) => (
              <TableRow key={sommelier.id}>
                <TableCell>{index + 1}</TableCell> {/* Numbering rows starting from 1 */}
                <TableCell>
                  <Link href={`https://twitter.com/${sommelier.taster_twitter_handle}`} target="_blank" rel="noopener noreferrer">
                    {sommelier.sommelier}
                  </Link>
                </TableCell>
                <TableCell>
                  {sommelier.number_of_wines}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}