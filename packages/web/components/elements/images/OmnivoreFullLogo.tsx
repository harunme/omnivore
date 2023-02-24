import { config } from '../../tokens/stitches.config'

export type OmnivoreFullLogoProps = {
  color?: string
  href?: string
  showTitle?: boolean
}

export function OmnivoreFullLogo(props: OmnivoreFullLogoProps): JSX.Element {
  const fillColor = props.color || config.theme.colors.graySolid
  const href = props.href || '/home'

  return (
    <svg
      width="129"
      height="26"
      viewBox="0 0 129 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M43.4131 13.2862C43.4131 9.75626 41.2214 7.74365 38.3606 7.74365C35.4839 7.74365 33.308 9.75626 33.308 13.2862C33.308 16.8004 35.4839 18.8288 38.3606 18.8288C41.2214 18.8288 43.4131 16.8162 43.4131 13.2862ZM41.1002 13.2862C41.1002 15.5728 40.0149 16.8109 38.3606 16.8109C36.701 16.8109 35.6209 15.5728 35.6209 13.2862C35.6209 10.9996 36.701 9.76153 38.3606 9.76153C40.0149 9.76153 41.1002 10.9996 41.1002 13.2862Z"
        fill={fillColor}
      />
      <path
        d="M47.3285 7.89117V18.6813H49.5413V11.6319H49.6309L52.4232 18.6286H53.9301L56.7224 11.6582H56.812V18.6813H59.0248V7.89117H56.2114L53.2399 15.1408H53.1134L50.1419 7.89117H47.3285Z"
        fill={fillColor}
      />
      <path
        d="M72.1549 7.89117H69.8842V14.6771H69.7893L65.1319 7.89117H63.1298V18.6813H65.4111V11.89H65.4901L70.1845 18.6813H72.1549V7.89117Z"
        fill={fillColor}
      />
      <path
        d="M78.5465 7.89117H76.2652V18.6813H78.5465V7.89117Z"
        fill={fillColor}
      />
      <path
        d="M84.5983 7.89117H82.0641L85.789 18.6813H88.7289L92.4485 7.89117H89.9196L87.3063 16.0891H87.2062L84.5983 7.89117Z"
        fill={fillColor}
      />
      <path
        d="M105.28 13.2862C105.28 9.75626 103.088 7.74365 100.227 7.74365C97.3504 7.74365 95.1745 9.75626 95.1745 13.2862C95.1745 16.8004 97.3504 18.8288 100.227 18.8288C103.088 18.8288 105.28 16.8162 105.28 13.2862ZM102.967 13.2862C102.967 15.5728 101.881 16.8109 100.227 16.8109C98.5675 16.8109 97.4874 15.5728 97.4874 13.2862C97.4874 10.9996 98.5675 9.76153 100.227 9.76153C101.881 9.76153 102.967 10.9996 102.967 13.2862Z"
        fill={fillColor}
      />
      <path
        d="M109.195 18.6813H111.476V14.8563H113.141L115.185 18.6813H117.704L115.412 14.4875C116.64 13.9606 117.319 12.8911 117.319 11.4159C117.319 9.27155 115.902 7.89117 113.452 7.89117H109.195V18.6813ZM111.476 13.0228V9.75626H113.015C114.332 9.75626 114.969 10.3411 114.969 11.4159C114.969 12.4854 114.332 13.0228 113.025 13.0228H111.476Z"
        fill={fillColor}
      />
      <path
        d="M121.157 18.6813H128.449V16.8004H123.438V14.224H128.053V12.3431H123.438V9.77206H128.427V7.89117H121.157V18.6813Z"
        fill={fillColor}
      />
      <path
        d="M8.42285 17.9061V10.5447C8.42285 9.91527 9.16173 9.55951 9.65432 9.99737L11.9257 13.3087C12.3909 13.6918 13.0477 13.6918 13.5129 13.3087L15.7296 10.0247C16.2222 9.61424 16.961 9.94263 16.961 10.5721V14.458C16.961 16.3463 18.2199 17.8788 20.1081 17.8788H20.1629C21.7775 17.8788 23.1731 16.7841 23.5563 15.2243C23.7478 14.4033 23.912 13.5549 23.912 12.8982C23.8847 6.46715 18.4388 1.596 11.9257 2.03385C6.39776 2.41698 1.9371 6.87764 1.55397 12.4056C1.11612 18.9187 6.26093 24.3645 12.7193 24.3645"
        stroke={fillColor}
        stroke-width="2.18182"
        stroke-miterlimit="10"
      />
    </svg>
  )
}
