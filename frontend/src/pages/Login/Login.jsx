import { useFormik } from "formik";
import * as yup from "yup";
import { Link, useLocation, useNavigate } from "react-router-dom";

const initialState = {
    email: "",
    password: ""
};

export function Login() {

    const navigate = useNavigate();
    const location = useLocation();

    const formik = useFormik({

        initialValues: initialState,

        validationSchema: yup.object({

            email: yup
                .string()
                .email("Invalid email")
                .required("Email is required"),

            password: yup
                .string()
                .required("Password is required")
        }),



        onSubmit: async (values, { setStatus }) => {
            try {
                const response = await fetch(
                    "http://localhost:5000/login",
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
                    setStatus(data.message || "Login failed. Check your details and try again.");
                    return;
                }

                if (!data.token) {
                    setStatus("We could not complete sign in. Please try again.");
                    return;
                }

                // Save JWT token
                localStorage.setItem("token", data.token);

                // Save user details
                if (data.user) {
                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );
                }

                window.dispatchEvent(new Event("gatherix-auth-change"));

                navigate("/");

            } catch {
                setStatus("Could not connect to Gatherix. Check your connection and try again.");
            }
        }


    });

    return (
        <div className="flex justify-center">

            <div className="m-10 p-10">

                <h1 className="text-center font-bold text-2xl">
                    Sign in
                </h1>

                {location.state?.message && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{location.state.message}</p>}
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
                        {formik.isSubmitting ? "Signing in..." : "Login"}
                    </button>

                    <p className="mt-4 text-center">
                        Don't have an account?{" "}
                        <Link to="/signup" className="font-bold underline">
                            Sign up
                        </Link>
                    </p>

                </form>

            </div>

        </div>
    );
}
