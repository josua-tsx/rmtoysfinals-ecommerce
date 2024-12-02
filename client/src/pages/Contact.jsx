import { IoLocation } from "react-icons/io5";
import { FaPhone } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaFacebook } from "react-icons/fa6";

export default function Contact() {
  return (
    <section className="pt-[130px] p-3 font-main">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col justify-center items-center">
          <div className="flex flex-col pb-40 pt-20 md:pt-40 gap-16">
            <div className="text-center flex flex-col gap-5">
            <h1 className="text-4xl md:text-5xl">CONTACTS</h1>
            <p className="text-xl md:text-2xl">
              Need help? Get in touch with us, <br /> and we’ll make sure to
              assist you as quickly as possible. <br /> Your satisfaction is our
              priority!
            </p>
            </div>
            <div className=" flex flex-col md:flex-row gap-10">
              <div className="flex flex-col items-center gap-2">
                <span>
                  <IoLocation size={30} />
                </span>
                <p className="text-lg">13 St. Lower Bicutan Taguig City</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span>
                  <FaPhone size={30} />
                </span>
                <p className="text-lg">09123456789</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span>
                  <MdEmail size={30} />
                </span>
                <p className="text-lg">rmtoys28@gmail.com</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span>
                  <FaFacebook size={30} />
                </span>
                <p className="text-lg">RM TOYS</p>
                <p className="underline text-indigo-700">
                  <a
                    className="underline text-indigo-700"
                    href="https://www.facebook.com/Rmcarsandmotorbikes"
                  >
                    facebook page link here!
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
