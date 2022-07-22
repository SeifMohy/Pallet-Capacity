import express from "express";
import { Request, Response, json, urlencoded } from "express";

const app = express();
const port = 3000;

app.use(json()); //express
app.use(urlencoded({ extended: true })); //express

type Items = {
  Length: number;
  Width: number;
  Height: number;
  IsStackable: boolean;
};

//Assumptions:
//Items are sent in decending order
//Items are stacked according to sent order
//Items will always fit avaiable pallet space
//Minimum amounts of pallets is 1
//If an item is un-stackable it is ordered below stackable
//Items can be slanted when stacked

function CalculatePalletsCount(items: Items[]): Number {
  let pallets = 1;
  let avaiableBase = 48 * 48;
  let availableHeight = 48;

  for (let i = 0; i < items.length; i++) {
    let maxHeight = 0;
    if (items[i].Height > maxHeight) {
      maxHeight = items[i].Height;
      console.log("maxHeight", maxHeight);
    }
    if (
      items[i].Length * items[i].Width > avaiableBase &&
      availableHeight > items[i].Height &&
      items[i - 1].IsStackable === true
    ) {
      if (items[i].IsStackable === true) {
        avaiableBase = 48 * 48;
        availableHeight -= maxHeight;
        console.log(
          "resetting with height stackable",
          avaiableBase,
          availableHeight
        );
      } else {
        //not stackable
        avaiableBase = 48 * 48;
        availableHeight = items[i].Height;
        console.log(
          "resetting with height unstackable",
          avaiableBase,
          availableHeight
        );
      }
    }
    if (items[i].IsStackable === true) {
      if (
        items[i].Length * items[i].Width <= avaiableBase &&
        items[i].Height <= availableHeight
      ) {
        avaiableBase -= items[i].Length * items[i].Width;
        console.log("availBase", avaiableBase);
      } else {
        console.log("adding pallet");
        pallets++;
        avaiableBase = 48 * 48;
        availableHeight = 48;
      }
    } else {
      //not stackable
      if (
        items[i].Length * items[i].Width <= avaiableBase &&
        items[i].Height <= availableHeight
      ) {
        avaiableBase -= items[i].Length * items[i].Width;
        console.log("availBase", avaiableBase);
      } else {
        console.log("adding pallet");
        pallets++;
        avaiableBase = 48 * 48;
        availableHeight = 48;
      }
    }
  }
  console.log("pallets", pallets);
  return pallets;
}

app.get("/", (req, res) => {
  res.send('Send items to "/countPallets"');
});

app.put("/countPallets", (req: Request, res: Response) => {
  console.log(req.body);
  res.json(CalculatePalletsCount(req.body));
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
