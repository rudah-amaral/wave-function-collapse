import { useState } from "react";
import Tile, { tilesetData } from "./Tile";

interface MosaicProps {
  cols: number;
  rows: number;
  tileSize: number;
}

export default function Mosaic({ cols, rows, tileSize }: MosaicProps) {
  let [grid, setGrid] = useState(Array<number | null>(cols * rows).fill(null));

  let tileOptions = tilesetData.map((_, index) => index);
  let gridOptions: number[][] = grid.map(() => tileOptions);

  grid.forEach((cellTileId, cellIndex) => {
    if (cellTileId === null) return;

    gridOptions[cellIndex] = [];
    limitNeighborsOptions(cellIndex);
  });

  function limitNeighborsOptions(cellIndex: number) {
    const cellTileId = grid[cellIndex] as number;
    const currentTile = tilesetData[cellTileId];
    const neighborsIndexes = getNeighborsIndexes(cellIndex);

    for (let neighborWay = 0; neighborWay < 4; neighborWay++) {
      let neighborIndex = neighborsIndexes[neighborWay];
      let neighborTileId = grid[neighborIndex];
      if (neighborTileId !== null) continue;

      const currentEdge = currentTile[neighborWay];
      limitCellsOptions(neighborIndex, neighborWay, currentEdge);
    }
  }

  function getNeighborsIndexes(cellIndex: number) {
    const rowOffset = Math.floor(cellIndex / cols) * cols;
    const rightIndex = ((cellIndex + 1) % cols) + rowOffset;
    const leftIndex = ((cellIndex + cols - 1) % cols) + rowOffset;

    const tilesAmount = rows * cols;
    const bottomIndex = (cellIndex + cols) % tilesAmount;
    const topIndex = (cellIndex - cols + tilesAmount) % tilesAmount;

    return [rightIndex, topIndex, leftIndex, bottomIndex];
  }

  function limitCellsOptions(cell: number, cellWay: number, cellEdge: string) {
    cellEdge = reverseString(cellEdge);
    const targetWay = (cellWay + 2) % 4;
    gridOptions[cell].forEach((possibleTileId) => {
      const possibleTile = tilesetData[possibleTileId];
      const possibleEdge = possibleTile[targetWay];
      const edgesNotCompatible = cellEdge !== possibleEdge;

      if (edgesNotCompatible) rejectTile(cell, possibleTileId);
    });
  }

  function reverseString(string: string) {
    let stringArray = string.split("");
    stringArray.reverse();
    return stringArray.join("");
  }

  function rejectTile(cellIndex: number, tileId: number) {
    const cellOptions = gridOptions[cellIndex].slice();
    const indexOfTileId = cellOptions.indexOf(tileId);
    if (indexOfTileId < 0) return;

    cellOptions.splice(indexOfTileId, 1);
    gridOptions[cellIndex] = cellOptions;
  }

  function handleClick() {
    let leastOptions = tilesetData.length;
    gridOptions.forEach((cellOptions) => {
      if (cellOptions.length !== 0 && cellOptions.length < leastOptions) {
        leastOptions = cellOptions.length;
      }
    });

    interface cellData {
      index: number;
      options: number[];
    }
    let cellsLeastOptions: cellData[] = [];
    gridOptions.forEach((options, index) => {
      const cellData: cellData = { index, options };
      if (options.length === leastOptions) cellsLeastOptions.push(cellData);
    });

    const randomCell = Math.floor(Math.random() * cellsLeastOptions.length);
    const selectedCell = cellsLeastOptions[randomCell];

    if (selectedCell === undefined) {
      let nextGrid = grid.slice().fill(null);
      setGrid(nextGrid);
      return;
    }

    let nextGrid = grid.slice();
    const randomTile = Math.floor(Math.random() * selectedCell.options.length);
    nextGrid[selectedCell.index] = selectedCell.options[randomTile];
    setGrid(nextGrid);
  }

  const gridStyle: React.CSSProperties = {
    display: "grid",
    width: "min-content",
    gridTemplateRows: `repeat(${rows}, ${tileSize}px)`,
    gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
  };

  return (
    <>
      <div style={gridStyle} onClick={handleClick}>
        {grid.map((tileId, index) => {
          const rowStart = Math.floor(index / cols) + 1;
          const colStart = (index % cols) + 1;

          const cellStyle: React.CSSProperties = {
            backgroundColor: "lightgray",
            gridArea: `${rowStart} / ${colStart} / ${rowStart + 1} / ${
              colStart + 1
            }`,
          };

          return (
            <span style={cellStyle}>
              {tileId === null ? (
                gridOptions[index].length
              ) : (
                <Tile id={tileId} size={tileSize} />
              )}
            </span>
          );
        })}
      </div>
    </>
  );
}