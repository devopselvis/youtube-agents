"""Sea trial for the console application's exact output and exit status."""

import os
import subprocess
import unittest
from pathlib import Path


PROJECT_DIR = Path(__file__).resolve().parent


class OutputTest(unittest.TestCase):
    def test_numbers_are_printed_once_in_order(self):
        # Build first so the test runs the app itself, without build chatter.
        subprocess.run(
            ["dotnet", "build", "--nologo", "--verbosity", "quiet"],
            cwd=PROJECT_DIR,
            check=True,
        )
        result = subprocess.run(
            ["dotnet", str(PROJECT_DIR / "bin/Debug/net11.0/NumbersOneToTen.dll")],
            cwd=PROJECT_DIR,
            capture_output=True,
            check=False,
        )

        # Compare bytes so missing, duplicated, or extra output cannot slip by.
        self.assertEqual(result.returncode, 0)
        expected = "".join(f"{number}{os.linesep}" for number in range(1, 11))
        self.assertEqual(result.stdout, expected.encode())
        self.assertEqual(result.stderr, b"")


if __name__ == "__main__":
    unittest.main()
