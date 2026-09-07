import { Autocomplete, TextField, Chip } from "@mui/material";
import { CustomPaper } from "./SearchPropertyOwner";
const amenitites = [
    "Washing Machine",
    "Heat Extractor",
    "Water Heater",
    "A/C",
    "CCTV",
    "Free Wifi",
    "24 Hour Power",
    "24 Hour Security",
    "Elevator",
    "Smart Home",
    "Fully-fitted Kitchen",
    "Fully-fitted Bathrooms",
    "Garden Area",
    "Swimming Pool",
    "Fully-equiped Gym",
];

const SelectAmeneties = ({ propertyAmenities, setPropertyAmenities, readOnly = false }) => {
  return (
    <div className="flex flex-col gap-2 font-mono">
          <span>Select Amenities {readOnly && "(Read-only)"}</span>
          <Autocomplete
              disabled={readOnly}
              freeSolo
              multiple
              options={amenitites}
              value={propertyAmenities || []}
              sx={{
                  bgcolor: readOnly ? "transparent" : "#fff",
                  "& .MuiOutlinedInput-notchedOutline": {
                      border: readOnly ? "none" : "1.5px solid #6B7280",
                      borderRadius: "8px",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#DADADA",
                  },
                  "& .MuiAutocomplete-inputRoot": {
                    padding: readOnly ? "0px !important" : "9px",
                  }
              }}
              renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                          <Chip
                              key={key}
                              label={option}
                              {...tagProps}
                              onDelete={readOnly ? undefined : tagProps.onDelete}
                              sx={{
                                  bgcolor: "#DBEAFE",
                                  color: "#1E40AF",
                                  fontFamily: "Unitext Bold",
                                  fontWeight: 700,
                                  fontSize: "14px",
                                  borderRadius: "8px",
                                  px: 1.5,
                                  height: "38px",
                                  border: "1.5px solid #93C5FD",
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                      bgcolor: "#BFDBFE",
                                  },
                                  "& .MuiChip-deleteIcon": {
                                      display: readOnly ? "none" : "block",
                                      color: "#4B5563",
                                      "&:hover": {
                                          color: "#1F2937",
                                      }
                                  }
                              }}
                          />
                      );
                  })
              }
              onBlur={(event) => {
                  const val = event.target.value;
                  if (val && val.trim() !== "" && !propertyAmenities.includes(val)) {
                      setPropertyAmenities((prev) => [...prev, val]);
                  }
              }}
              renderInput={(params) => (
                  <TextField 
                    {...params} 
                    placeholder={readOnly ? "" : "Select amenities"} 
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            padding: readOnly ? "0 !important" : undefined
                        }
                    }}
                  />
              )}
              onChange={(event, newValue) => {
                  setPropertyAmenities(newValue);
              }}
              PaperComponent={CustomPaper}
          />
    </div>
  );
};

export default SelectAmeneties;