// Refresh checked public aircraft assets only. Does not overwrite evidence or counts.
import fs from "node:fs";
for (const airline of ["china-airlines", "eva-air", "starlux"]) {
  const fleet = JSON.parse(
    fs.readFileSync("data/" + airline + "/fleet.json", "utf8"),
  );
  for (const aircraft of fleet.items) {
    const photo = aircraft.photo;
    if (
      !photo?.original_url ||
      !/^aircraft\/[a-z0-9-]+\.(png|jpg|webp)$/.test(photo.image_url)
    )
      throw Error("Invalid asset path");
    const response = await fetch(photo.original_url);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (
      !response.ok ||
      !(
        bytes.subarray(0, 4).toString() === "RIFF" ||
        (bytes[0] === 255 && bytes[1] === 216) ||
        (bytes[0] === 137 && bytes[1] === 80)
      )
    )
      throw Error("Not an image: " + photo.original_url);
    fs.writeFileSync("public/" + photo.image_url, bytes);
    console.log(airline, aircraft.aircraft_type, bytes.length);
  }
}
