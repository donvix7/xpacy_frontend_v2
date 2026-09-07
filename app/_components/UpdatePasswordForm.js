"use client"
import { useForm } from "react-hook-form";
import FormInput from "./FormInput";
import SpinnerMini from "./SpinnerMini";
import { useTransition } from "react";
import { updateUserPassword } from "../_lib/action";
import toast from "react-hot-toast";


export default function UpdatePasswordForm({ updateAction }) {
    const [pending, startTransition] = useTransition();
    const { handleSubmit, register, formState: { errors }, getValues, reset } = useForm();
    const onSubmit = async (data) => {
        startTransition(async () => {
             const action = updateAction || updateUserPassword;
            const response = await action(data);
            if (response.success) {
                toast.success(response.message)
            };
            if (!response.success) toast.error(response.message);
        })
    }
    return (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
            <FormInput label={"Current Password"} id={"currentPasword"} >
                <input {...register("currentPassword", {
                    required: "Current Password is required",
                })} type={"password"} name={"currentPassword"} id={"currentPassword"} placeholder={"Enter your password"} disabled={pending} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.currentPassword ? "border-error" : "border-primary-200 disabled:bg-gray-300 disabled:cursor-not-allowed"}`} />
                {errors.currentPassword && <span className="-mt-2 text-xs text-error">{errors.currentPassword.message}</span>}
            </FormInput>
            <FormInput label={"New Password"} id={"newPasword"} >
                <input {...register("newPassword", {
                    required: "This field is required",
                    validate: (value) => value !== getValues().currentPassword || "Passwords Cannot be the same",
                })} type={"password"} name={"newPassword"} id={"newPassword"} placeholder={"Enter new password"} disabled={pending} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.newPassword ? "border-error" : "border-primary-200 disabled:bg-gray-300 disabled:cursor-not-allowed"}`} />
                {errors.newPassword && <span className="-mt-2 text-xs text-error">{errors.newPassword.message}</span>}
            </FormInput>
             <div className="flex items-center justify-center gap-4 mt-6 ">
                <button type="submit" disabled={pending} className="bg-primary text-white  cursor-pointer  px-5 py-3 font-semibold flex space-x-2.5 font-mono items-center justify-center rounded-md hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-black"> <span>Save Changes</span> <span>{pending && <SpinnerMini />}</span> </button>
            </div>
        </form>
    )
}