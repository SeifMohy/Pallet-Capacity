//Assumptions:
//Items will always fit avaiable pallet space
//Minimum amount of pallets is 1
//Items can be slanted when stacked
//Items are sorted according to decreasing bottom area and if IsStackable

import express from "express";
import { Request, Response, json, urlencoded } from "express";

const app = express();
const port = 3000;

app.use(json());
app.use(urlencoded({ extended: true }));

type Items = {
  Length: number;
  Width: number;
  Height: number;
  IsStackable: boolean;
};

type PalletSize = {
  Length: number;
  Width: number;
  Height: number;
};
const palletSize = { Length: 48, Width: 48, Height: 48 };

function SortPallets(items: Items[]): Items[] {
  const stackableItems = items.filter((item) => item.IsStackable === true);
  const sortedstackableItems = stackableItems.sort(
    (a: Items, b: Items) => b.Length * b.Width - a.Length * b.Width
  );
  const nonStackableItems = items.filter((item) => item.IsStackable === false);
  const sortedNonStackableItems = nonStackableItems.sort(
    (a: Items, b: Items) => b.Length * b.Width - a.Length * b.Width
  );

  const sortedItems = sortedstackableItems.concat(sortedNonStackableItems);
  return sortedItems;
}

function CalculatePalletsCount(items: Items[], palletSize: PalletSize): Number {
  const palletArea = palletSize.Length * palletSize.Width;
  const palletHeight = palletSize.Height;
  let avaiableArea = palletArea;
  let availableHeight = palletHeight;
  let pallets = 1;

  for (let i = 0; i < items.length; i++) {
    const itemBaseArea = items[i].Length * items[i].Width;
    let maxHeight = 0;
    if (items[i].Height > maxHeight) {
      maxHeight = items[i].Height;
      console.log("maxHeight", maxHeight);
    }
    if (
      itemBaseArea > avaiableArea &&
      availableHeight > items[i].Height &&
      items[i - 1].IsStackable === true
    ) {
      if (items[i].IsStackable === true) {
        avaiableArea = palletArea;
        availableHeight -= maxHeight;
        console.log(
          "resetting with height stackable",
          avaiableArea,
          availableHeight
        );
      } else {
        //not stackable
        avaiableArea = palletArea;
        availableHeight = items[i].Height;
        console.log(
          "resetting with height unstackable",
          avaiableArea,
          availableHeight
        );
      }
    }
    if (items[i].IsStackable === true) {
      if (itemBaseArea <= avaiableArea && items[i].Height <= availableHeight) {
        avaiableArea -= itemBaseArea;
        console.log("availBase", avaiableArea);
      } else {
        console.log("adding pallet");
        pallets++;
        avaiableArea = palletArea;
        availableHeight = palletHeight;
      }
    } else {
      //not stackable
      if (itemBaseArea <= avaiableArea && items[i].Height <= availableHeight) {
        avaiableArea -= itemBaseArea;
        console.log("availBase", avaiableArea);
      } else {
        console.log("adding pallet");
        pallets++;
        avaiableArea = palletArea;
        availableHeight = palletHeight;
      }
    }
  }
  console.log("pallets", pallets);
  return pallets;
}

app.get("/", (req, res) => {
  res.send('Put items to "/countPallets"');
});

app.put("/countPallets", (req: Request, res: Response) => {
  try {
    res.json(CalculatePalletsCount(SortPallets(req.body), palletSize));
  } catch (error) {
    res.json(
      "Please provide items in an array of objects with keys of Length, Width, and Height as a number and IsStackable as a boolean. For example: `[{ 'Length': 20, 'Width': 20, 'Height': 20, 'IsStackable': false }]` "
    );
    console.log(error);
  }
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
