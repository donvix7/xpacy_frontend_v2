
export default function SelectCity({ cities, register, errors }) {
    return (
        <>
            <select {...register("state", { required: "Please choose a city" })} className={`xp-field ${errors.state ? "xp-field-error" : ""}`}>
                <option value={""}>Choose a city</option>
                {
                    cities?.map((city) => {
                        return <option key={city.id} name="state">{city.location}</option>
                    })
                }
            </select>
            {errors.state && <span className="-mt-2 text-xs text-error">{errors.state.message}</span>}
        </>

    )
}