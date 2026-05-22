// src/components/Footer.tsx

export default function Footer() {

  const policyLinks = [
    "Payment Guide",
    "Privacy Policy",
    "Terms and conditions",
    "Shipping Policy",
    "Return & Refund Policy",
    "FAQ",
  ];

  const payments = [
    "Apple Pay",
    "QRIS",
    "VNPay",
    "ZaloPay",
    "Visa",
    "Mastercard",
  ];

  return (

    <footer
      className="
        relative
        bg-[#0B0B0B]
        border-t
        border-white/10
        mt-20
      "
      id="footer"
    >

      <div
        className="
          max-w-[1400px]
          mx-auto
          px-6
          py-14
          text-white
        "
      >

        {/* TOP */}
        <div
          className="
            flex
            flex-col
            items-center
            text-center
            gap-6
            border-b
            border-white/10
            pb-10
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-gradient-to-br
                from-pink-500
                to-purple-600
                flex
                items-center
                justify-center
                font-black
                text-lg
              "
            >
              E
            </div>

            <div className="text-left">

              <h2
                className="
                  text-2xl
                  font-black
                  tracking-wide
                "
              >
                EVENTISTA
              </h2>

              <p className="text-sm text-gray-400">
                Powered Entertainment Platform
              </p>

            </div>

          </div>

          <p
            className="
              max-w-[950px]
              text-gray-400
              leading-8
              text-[15px]
            "
          >
            1ZONE is a platform for distributing event tickets,
            merchandise, and souvenirs, developed and operated by
            EVENTISTA to provide fans with a comprehensive experience
            in connecting and engaging with entertainment artists.
            Leveraging a diverse ecosystem of solutions including
            1VOTE and 1ZONE, EVENTISTA has become a strategic partner
            to leading entertainment companies.
          </p>

        </div>

        {/* POLICY LINKS */}
        <div
          className="
            grid
            grid-cols-2
            md:grid-cols-3
            gap-4
            py-10
            border-b
            border-white/10
          "
        >

          {policyLinks.map((item) => (

            <button
              key={item}
              className="
                text-left
                md:text-center
                text-gray-400
                hover:text-white
                transition
              "
            >
              {item}
            </button>

          ))}

        </div>

        {/* MAIN GRID */}
        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-4
            gap-10
            py-12
            border-b
            border-white/10
          "
        >

          {/* SUPPORT */}
          <div>

            <h3
              className="
                text-lg
                font-bold
                mb-5
              "
            >
              Support
            </h3>

            <div className="space-y-3 text-gray-400">

              <div className="flex gap-3">
                <span className="font-semibold text-white">
                  Email:
                </span>

                <span>
                  contact@eventista.vn
                </span>
              </div>

              <div className="flex gap-3">
                <span className="font-semibold text-white">
                  Hotline:
                </span>

                <span>
                  +84 8 32 338 688
                </span>
              </div>

              <div className="flex gap-3 items-center">

                <span className="font-semibold text-white">
                  Social:
                </span>

                <div className="flex gap-2">

                  <div
                    className="
                      w-9
                      h-9
                      rounded-full
                      bg-white/10
                      flex
                      items-center
                      justify-center
                      hover:bg-pink-500
                      transition
                      cursor-pointer
                    "
                  >
                    f
                  </div>

                  <div
                    className="
                      w-9
                      h-9
                      rounded-full
                      bg-white/10
                      flex
                      items-center
                      justify-center
                      hover:bg-pink-500
                      transition
                      cursor-pointer
                    "
                  >
                    ig
                  </div>

                  <div
                    className="
                      w-9
                      h-9
                      rounded-full
                      bg-white/10
                      flex
                      items-center
                      justify-center
                      hover:bg-pink-500
                      transition
                      cursor-pointer
                    "
                  >
                    in
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* CONNECT */}
          <div>

            <h3
              className="
                text-lg
                font-bold
                mb-5
              "
            >
              Connect with us
            </h3>

            <div className="space-y-4 text-gray-400">

              <p>
                https://eventistax.com
              </p>

              <div className="flex gap-3">

                {["FB", "TT", "IN"].map((x) => (

                  <div
                    key={x}
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-white/10
                      hover:bg-white
                      hover:text-black
                      transition
                      flex
                      items-center
                      justify-center
                      cursor-pointer
                    "
                  >
                    {x}
                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* PAYMENT */}
          <div>

            <h3
              className="
                text-lg
                font-bold
                mb-5
              "
            >
              Payment Method
            </h3>

            <div
              className="
                flex
                flex-wrap
                gap-3
              "
            >

              {payments.map((p) => (

                <div
                  key={p}
                  className="
                    px-4
                    py-2
                    rounded-xl
                    bg-white/5
                    border
                    border-white/10
                    text-sm
                    text-gray-300
                  "
                >
                  {p}
                </div>

              ))}

            </div>

          </div>

          {/* CERTIFIED */}
          <div>

            <h3
              className="
                text-lg
                font-bold
                mb-5
              "
            >
              eCommerce Certified
            </h3>

            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/5
                p-6
              "
            >

              <div
                className="
                  w-full
                  h-28
                  rounded-xl
                  border
                  border-dashed
                  border-white/20
                  flex
                  items-center
                  justify-center
                  text-gray-500
                "
              >
                Ministry Certificate
              </div>

            </div>

          </div>

        </div>

        {/* COMPANY INFO */}
        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-4
            gap-8
            py-12
          "
        >

          <div>

            <h4
              className="
                font-bold
                mb-4
              "
            >
              Việt Nam
            </h4>

            <p className="text-gray-400 leading-7 text-sm">
              38/15B Nguyễn Văn Trỗi,
              Phường Cầu Kiệu,
              TP Hồ Chí Minh.
            </p>

            <p className="text-gray-500 text-sm mt-3">
              Business Registration:
              0110372057
            </p>

          </div>

          <div>

            <h4
              className="
                font-bold
                mb-4
              "
            >
              Hong Kong
            </h4>

            <p className="text-gray-400 leading-7 text-sm">
              SUITE C, LEVEL 7,
              WORLD TRUST TOWER,
              50 STANLEY STREET,
              CENTRAL, HONG KONG
            </p>

          </div>

          <div>

            <h4
              className="
                font-bold
                mb-4
              "
            >
              United Kingdom
            </h4>

            <p className="text-gray-400 leading-7 text-sm">
              71-75 Shelton Street
              Covent Garden London,
              WC2H 9JQ
            </p>

          </div>

          <div>

            <h4
              className="
                font-bold
                mb-4
              "
            >
              United States
            </h4>

            <p className="text-gray-400 leading-7 text-sm">
              Eventista LLC
              <br />
              1001 S Main ST STE 600
              Kalispell, MT 59901
            </p>

          </div>

        </div>

        {/* COPYRIGHT */}
        <div
          className="
            border-t
            border-white/10
            pt-8
            text-center
            text-gray-500
            text-sm
          "
        >
          ©2025 Copyright belongs to Eventista
        </div>

      </div>

    </footer>

  );
}