import { getInvoice } from "./app/_lib/data-services.js"
console.log(await getInvoice({value: "test"}, "test"))
