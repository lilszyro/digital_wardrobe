#!/usr/bin/env python3
import os
import shutil
import subprocess
import sys


def validate_diagram(file_path):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.", file=sys.stderr)
        return 1

    # Get absolute path of the file
    abs_file_path = os.path.abspath(file_path)

    # Define temp directory within the skill folder
    skill_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    temp_dir = os.path.join(skill_dir, "temp_render")
    os.makedirs(temp_dir, exist_ok=True)

    try:
        # Run plantuml to generate png in the temp directory
        # Using -tpng and -o to direct output
        cmd = ["plantuml", "-tpng", "-o", temp_dir, abs_file_path]
        result = subprocess.run(  # noqa: UP022
            cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )

        if result.returncode != 0:
            print(
                "Rendering failed with exit code:",
                result.returncode,
                file=sys.stderr,
            )
            print("Stdout:", result.stdout, file=sys.stderr)
            print("Stderr:", result.stderr, file=sys.stderr)
            return result.returncode

        # Check if files were generated in the temp directory
        generated_files = os.listdir(temp_dir)
        if not generated_files:
            print(
                "Error: No rendered output file was generated.", file=sys.stderr
            )
            if result.stderr:
                print("Stderr:", result.stderr, file=sys.stderr)
            return 1

        print(
            f"Success: Diagram rendered successfully. Generated {
                len(generated_files)
            } image(s):"
        )
        for f in generated_files:
            print(f" - {f}")
        return 0

    except Exception as e:
        print(
            f"An unexpected error occurred during rendering check: {e}",
            file=sys.stderr,
        )
        return 1
    finally:
        # Clean up temp directory
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(
            "Usage: python validate_diagram.py <path_to_puml_file>",
            file=sys.stderr,
        )
        sys.exit(1)
    sys.exit(validate_diagram(sys.argv[1]))
