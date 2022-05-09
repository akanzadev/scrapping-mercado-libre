import puppeteer from "puppeteer";
import { getRandom } from "random-useragent";
import ExcelJs from "exceljs";

const gtxUrl =
  "https://listado.mercadolibre.com.pe/gtx-1650-super#D[A:gtx%201650%20super]";

const saveExcel = (data: any) => {
  try {
    const workbook = new ExcelJs.Workbook();
    const fileName = "list-gtx-1650-super.xlsx";

    const sheet = workbook.addWorksheet("Listado");

    const rtaColumns = [
      { header: "Price", key: "price" },
      { header: "Name", key: "name" },
      { header: "Image", key: "img" },
    ];

    sheet.columns = rtaColumns;
    sheet.addRows(data);

    workbook.xlsx.writeFile(fileName).then(() => {
      console.log("File created");
    });
  } catch (error) {
    console.log("Error: ", error);
  }
};

(async () => {
  const header = getRandom();
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  await page.setUserAgent(header);
  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto(gtxUrl);

  await page.screenshot({
    path: "./screenshots/gtx-1650-super.png",
    // fullPage: true,
  });

  await page.waitForSelector(".ui-search-results");
  const listItems = await page.$$(".ui-search-results .ui-search-layout__item");

  let data = [];
  for (const item of listItems) {
    const itemPrice = await item.$(".price-tag-fraction");
    const itemName = await item.$(".ui-search-item__title");
    const itemImage = await item.$(".ui-search-result-image__element");
    const price = await page.evaluate((item) => item.innerText, itemPrice);
    const name = await page.evaluate((item) => item.innerText, itemName);
    const img = await page.evaluate(
      (image) => image.getAttribute("src"),
      itemImage
    );

    data.push({ price, name, img });
  }

  await browser.close();
  saveExcel(data);
})();
