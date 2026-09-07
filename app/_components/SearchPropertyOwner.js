import { Autocomplete,  TextField, Paper } from "@mui/material";
export const CustomPaper = (props) => {
    return (
        <Paper
            sx={{
                "& .MuiAutocomplete-option": {
                    fontFamily: "Unitext Regular",
                    fontSize: "1rem",
                    borderBottom: "1px solid #DADADA",
                    padding: "8px",
                },
            }}
            {...props}
        />
    );
};

const SearchPropertyOwner = ({ allOwners, propertyOwner, setPropertyOwner, disabled=false }) => {
  return (
    <div className="flex flex-col gap-2 font-mono">
                    <span className="text-sm">Search for property owner’s account</span>
                    <Autocomplete
                        disabled={disabled}
                        sx={{
                            width: "100%",
                            "& .MuiOutlinedInput-notchedOutline": {
                                border: "1.5px solid #DADADA",
                                borderRadius: "8px",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#DADADA",
                            },
                        }}
                        PaperComponent={CustomPaper}
                        options={allOwners || []}
                        // onBlur={(event) => event.target.value !== searchField ? setSearchField(event.target.value) : null}
                        getOptionLabel={(option) =>
                            typeof option === "string"
                                ? option
                                : `${option?.first_name} ${option?.last_name}`
                        }
                        getOptionKey={(option) => option.id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Enter property owner’s name or email"
                            />
                        )}
                        value={propertyOwner}
                        onChange={(event, newValue) => {
                            setPropertyOwner(newValue);
                        }}
                    />
                </div>
  );
};

export default SearchPropertyOwner;