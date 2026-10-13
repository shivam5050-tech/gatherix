import { useFormik } from "formik";
import * as yup from "yup";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const initialState = {
    email: "",
    password: ""
};

export function Login() {

    const navigate = useNavigate();

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



        onSubmit: async (values) => {
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

                console.log("Login response:", data);

                if (!response.ok) {
                    alert(data.message || "Login failed");
                    return;
                }

                if (!data.token) {
                    alert("Login worked, but the backend did not return a token.");
                    return;
                }

                // Save JWT token
                localStorage.setItem("token", data.token);

                console.log(
                    "Token saved:",
                    localStorage.getItem("token") !== null
                );
                console.log("Current origin:", window.location.origin);

                // Save user details
                if (data.user) {
                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );
                }

                window.dispatchEvent(new Event("gatherix-auth-change"));

                alert("Login successful");
                navigate("/");

            } catch (error) {
                console.error("Login error:", error);
                alert("Server error. Please try again.");
            }
        }


    });

    return (
        <div className="flex justify-center">

            <div className="m-10 p-10">

                <h1 className="text-center font-bold text-2xl">
                    Sign in
                </h1>

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
                            <p>{formik.errors.email}</p>
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
                            <p>{formik.errors.password}</p>
                        ) : null}

                    </div>


                    <button
                        type="submit"
                        className="border rounded-sm py-2 px-4 font-bold mt-2 ml-20"
                    >
                        Login
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
