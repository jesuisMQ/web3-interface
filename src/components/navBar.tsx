import { Link } from "react-router-dom"

const items = [
  {
    name: "Homepage",
    href: "/"
  },
  {
    name: "Ranking",
    href: "/leaderboard"
  },
  {
    name: "Contestants",
    href: "/candidates"
  }
]

export default function NavBar() {

  return (
    <div className="w-full bg-[#151515] border-b border-white/10">

      <div className="py-2 flex gap-3 flex-nowrap min-w-max w-fit mx-auto">

        {items.map((item, index) => (

          <div
            key={item.name}
            className="flex justify-center items-center gap-3 shrink-0"
          >

            {/* DOT */}
            {index !== 0 && (
              <div className="fill-white opacity-50">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="7"
                  height="6"
                  viewBox="0 0 7 6"
                >
                  <circle
                    opacity="0.5"
                    cx="3.5"
                    cy="3"
                    r="3"
                    fill="white"
                  />

                </svg>

              </div>
            )}

            {/* LINK */}
            <Link
              to={item.href}
              className="
                text-[13px]
                text-white
                font-medium
                leading-[18px]
                hover:underline
                transition
              "
            >
              {item.name}
            </Link>

          </div>

        ))}

      </div>

    </div>
  )
}