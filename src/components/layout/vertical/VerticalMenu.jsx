// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
import CustomChip from '@/@core/components/mui/Chip'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }) => {
  const id = undefined

  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuItem href='/dashboard' icon={<i className='tabler-smart-home' />}>
          Dashboard
        </MenuItem>

        <SubMenu
          label='Products'
          icon={<i className='tabler-smart-home' />}
          suffix={<CustomChip label='3' size='small' color='error' round='true' />}
        >
          <MenuItem href='/apps/products/list'>All Products</MenuItem>
          <MenuItem href='/apps/products/add'>Add Product</MenuItem>
          <MenuItem href='/apps/products/category'>Category</MenuItem>
        </SubMenu>

        <SubMenu label='Stock List' icon={<i className='tabler-smart-home' />}>
          <MenuItem href='/apps/stockList/allStock'>All Stock</MenuItem>
          <MenuItem href='/apps/stockList/lowStock'>Low Stock</MenuItem>
          <MenuItem href='/apps/stockList/expiredProducts'>Expired Products</MenuItem>
        </SubMenu>

        <SubMenu label='Customers' icon={<i className='tabler-smart-home' />}>
          <MenuItem href='/apps/customers/list'>All Customers</MenuItem>
          <MenuItem href={`/apps/customers/details/${'879861'}`} exactMatch={false} activeUrl='/apps/customers/details'>
            Details
          </MenuItem>
        </SubMenu>

        <SubMenu label='Suppliers' icon={<i className='tabler-smart-home' />}>
          <MenuItem href='/apps/suppliers/list' icon={<i className='tabler-smart-home' />}>
            All Suppliers
          </MenuItem>

          <MenuItem
            href={`/apps/suppliers/details/${id}`}
            disabled={!id}
            icon={<i className='tabler-smart-home' />}
            exactMatch={false}
            activeUrl='/apps/suppliers/details'
          >
            Details
          </MenuItem>
        </SubMenu>

        <SubMenu label='Purchase' icon={<i className='tabler-smart-home' />}>
          <MenuItem href='/apps/purchase/add'>Add Purchase</MenuItem>
          <MenuItem href='/apps/purchase/list'>Purchase List</MenuItem>
          <MenuItem href='/apps/purchase/return'>Purchase Return</MenuItem>
        </SubMenu>

        <SubMenu label='Sales' icon={<i className='tabler-smart-home' />}>
          <MenuItem href='/apps/sales/pos'>POS</MenuItem>
          <MenuItem href='/apps/sales/list'>Sales List</MenuItem>
          <MenuItem href='/apps/sales/return'>Sales Return</MenuItem>
        </SubMenu>
        <MenuItem href='/apps/expenses/list' icon={<i className='tabler-smart-home' />}>
          Expenses
        </MenuItem>
      </Menu>
      {/* <Menu
          popoutMenuOffset={{ mainAxis: 23 }}
          menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
          renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
          renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
          menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
        >
          <GenerateVerticalMenu menuData={menuData(dictionary)} />
        </Menu> */}
    </ScrollWrapper>
  )
}

export default VerticalMenu
