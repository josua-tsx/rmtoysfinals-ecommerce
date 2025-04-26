


import RMTOYSLOGO from "../assets/RMTOYSLOGOFINAL.png";

export default function FooterSection() {
  return (
    <div className="max-w-[1280px] mx-auto text-sm md:text-normal pt-[155px] ">
      <div className="flex justify-between flex-col px-4 gap-10 md:gap-0 md:flex-row items-center py-20 border-t-gray-200  border border-r-0 border-b-0 border-l-0">
        <div className="flex flex-col gap-4 items-center md:items-start flex-1">
            <img src={RMTOYSLOGO} className="w-[90px] " alt="" />

          <div className="w-[300px]">
            A seamless and intuitive online library system that brings millions
            of books to your fingertips. Access, borrow, and explore like never
            before.
          </div>
        </div>

        <div className="flex gap-10 flex-1">
          <div className="flex flex-col gap-4 flex-1">
            <h1>Contact Us</h1>
            <h1>Careers</h1>
            <h1>Ethos</h1>
            <h1>Help</h1>
            <h1>Status</h1>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            <h1>Sign Up</h1>
            <h1>Terms Of Service</h1>
            <h1>Privacy Policy</h1>
            <h1>Acts Notices</h1>
            <h1>Labs</h1>
          </div>
        </div>
      </div>
    </div>
  )
}
