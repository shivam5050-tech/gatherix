import { useFormik } from "formik";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";

const initialState = {
    email: "",
    password: ""
};

export function Signup() {
    const navigate = useNavigate()

    const formik = useFormik({
        initialValues: initialState,

        validationSchema: yup.object({
            email: yup
                .string()
                .email("Invalid email")
                .required("Email is required"),

            password: yup
                .string()
                .min(6, "Password must be at least 6 characters")
                .required("Password is required")
        }),

        onSubmit: async (values, { setStatus }) => {

            try {

                const response = await fetch(
                    "http://localhost:5000/signup",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(values)
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    setStatus(data.message || "Could not create your account. Please try again.");
                    return;
                }

                formik.resetForm();
                navigate("/login", { state: { message: "Your account was created. Sign in to continue." } });


            } catch {
                setStatus("Could not connect to Gatherix. Check your connection and try again.");

            }
        }
    });

    return (
        <div className="flex justify-center">

            <div className="m-10 p-10">

                <h1 className="text-center font-bold text-2xl">
                    Sign up
                </h1>

                {formik.status && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">{formik.status}</p>}

                <form onSubmit={formik.handleSubmit}>

                    <div>
                        <label className="block">
                            Email
                        </label>

                        <input
                            type="email"
                            {...formik.getFieldProps("email")}
                            placeholder="gamer@gmail.com"
                            className="p-1 border rounded-sm my-2"
                        />

                        {formik.touched.email &&
                        formik.errors.email ? (
                            <p className="text-sm text-rose-700">{formik.errors.email}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="block">
                            Password
                        </label>

                        <input
                            type="password"
                            {...formik.getFieldProps("password")}
                            placeholder="********"
                            className="p-1 border rounded-sm my-2"
                        />

                        {formik.touched.password &&
                        formik.errors.password ? (
                            <p className="text-sm text-rose-700">{formik.errors.password}</p>
                        ) : null}
                    </div>


                    <button
                        type="submit"
                        className="border rounded-sm py-2 px-4 font-bold mt-2 ml-20 disabled:cursor-wait disabled:opacity-60"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? "Creating account..." : "Signup"}
                    </button>

                    <p className="mt-4 text-center text-sm">Already have an account? <Link className="font-bold underline" to="/login">Log in</Link></p>

                </form>

            </div>

        </div>
    );
}
