import React from 'react';

export default function Footer() {
    return (
        <div>
            <footer className="w-full bg-white shadow-inner mt-auto">
                <div className="max-w-6xl mx-auto text-center py-4 text-sm text-gray-500">
                    © {new Date().getFullYear()} Sumit Mazumdar. All rights
                    reserved.
                </div>
            </footer>
        </div>
    );
}
