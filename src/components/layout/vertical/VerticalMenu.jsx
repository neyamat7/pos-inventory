// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSession } from 'next-auth/react'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)



const VerticalMenu = ({ scrollMenu }) => {
  const id = undefined
  const session = useSession()
  const isAdmin = session?.data?.user?.role === 'admin'

  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
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
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuItem href='/dashboard' icon={<i className='tabler-layout-dashboard' />}>
          Dashboard
        </MenuItem>

        {isAdmin && (
          <MenuItem href='/apps/users' icon={<i className='tabler-users' />}>
            Users
          </MenuItem>
        )}

        <SubMenu label='Products' icon={<i className='tabler-box' />}>
          <MenuItem href='/apps/products/list'>All Products</MenuItem>
          <MenuItem href='/apps/products/add'>Add Product</MenuItem>
          <MenuItem href='/apps/products/category'>Category</MenuItem>
        </SubMenu>

        <SubMenu label='Customers' icon={<i className='tabler-user-circle' />}>
          <MenuItem href='/apps/customers/list'>All Customers</MenuItem>
          <MenuItem
            href={`/apps/customers/details/${id}`}
            disabled={!id}
            exactMatch={false}
            activeUrl='/apps/customers/details'
          >
            Details
          </MenuItem>
        </SubMenu>

          <SubMenu label='Suppliers' icon={<i className='tabler-building-store' />}>
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

        <MenuItem href='/apps/cratesMangement' icon={<i className='tabler-receipt' />}>
          Crates
        </MenuItem>

          <SubMenu label='Purchase' icon={<i className='tabler-shopping-bag' />}>
            <MenuItem href='/apps/purchase/add'>Add Purchase</MenuItem>
            <MenuItem href='/apps/purchase/list'>Purchase List</MenuItem>
          </SubMenu>

          <MenuItem href='/apps/stockList/lot' icon={<i className='tabler-packages' />}>
            Stock List
          </MenuItem>

        <SubMenu label='Sales' icon={<i className='tabler-cash' />}>
          <MenuItem href='/apps/sales/pos'>POS</MenuItem>
          <MenuItem href='/apps/sales/list'>Sales List</MenuItem>
        </SubMenu>

          <MenuItem href='/apps/dueList' icon={<i className='tabler-receipt' />}>
            Due List
          </MenuItem>

        <SubMenu label='Expenses' icon={<i className='tabler-wallet' />}>
          <MenuItem href='/apps/expenses/list'>Expense List</MenuItem>
          <MenuItem href='/apps/expenses/category'>Expense Category</MenuItem>
        </SubMenu>

            <MenuItem href='/apps/income' icon={<i className='tabler-currency-taka' />}>
              Income
            </MenuItem>

            <MenuItem href='/apps/accounts/list' icon={<i className='tabler-credit-card' />}>
              Accounts
            </MenuItem>

            <MenuItem href='/apps/profitLoss' icon={<i className='tabler-credit-card' />}>
              Profit & Loss
            </MenuItem>

            <MenuItem href='/apps/activityLog' icon={<i className='tabler-chart-bar' />}>
              Activity Log
            </MenuItem>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
