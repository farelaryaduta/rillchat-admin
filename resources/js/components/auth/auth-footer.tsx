export default function AuthFooter() {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-sm border-t py-6">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-medium mb-3">ABOUT</h3>
            <p className="text-sm text-muted-foreground">
              RillChat Admin Dashboard - Manage your chat application with ease.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-3">QUICK LINKS</h3>
            <ul className="space-y-2">
              <li>
                <a href={route('dashboard')} className="text-sm text-muted-foreground hover:text-primary">
                  Dashboard
                </a>
              </li>
              <li>
                <a href={route('users')} className="text-sm text-muted-foreground hover:text-primary">
                  Users
                </a>
              </li>
              <li>
                <a href={route('messages')} className="text-sm text-muted-foreground hover:text-primary">
                  Messages
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-3">SUPPORT</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          © 2025 RillChat. All rights reserved.
        </div>
      </div>
    </footer>
  )
} 