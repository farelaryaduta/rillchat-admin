import { Link } from '@inertiajs/react';

export default function Footer() {
    return (
        <footer className="border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                                About
                            </h3>
                            <p className="mt-4 text-sm text-gray-600">
                                RillChat Admin Dashboard - Manage your chat application with ease.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                                Quick Links
                            </h3>
                            <ul className="mt-4 space-y-4">
                                <li>
                                    <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/users" className="text-sm text-gray-600 hover:text-gray-900">
                                        Users
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/messages" className="text-sm text-gray-600 hover:text-gray-900">
                                        Messages
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                                Support
                            </h3>
                            <ul className="mt-4 space-y-4">
                                <li>
                                    <Link href="/help" className="text-sm text-gray-600 hover:text-gray-900">
                                        Help Center
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                                        Terms of Service
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t pt-8">
                        <p className="text-sm text-gray-600">
                            &copy; {new Date().getFullYear()} RillChat. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
} 