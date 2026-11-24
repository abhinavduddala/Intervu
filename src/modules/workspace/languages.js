/**
 * Languages supported by the in-app coding workspace.
 * `judge0Id` values match the Judge0 CE language catalogue (GET /languages).
 * Java programs must declare `public class Main`.
 */
const LANGUAGES = {
  python: { key: 'python', label: 'Python 3', judge0Id: 71, monaco: 'python' },
  java: { key: 'java', label: 'Java', judge0Id: 62, monaco: 'java' },
  cpp: { key: 'cpp', label: 'C++', judge0Id: 54, monaco: 'cpp' },
  c: { key: 'c', label: 'C', judge0Id: 50, monaco: 'c' },
  javascript: { key: 'javascript', label: 'JavaScript (Node.js)', judge0Id: 63, monaco: 'javascript' },
  go: { key: 'go', label: 'Go', judge0Id: 60, monaco: 'go' },
  csharp: { key: 'csharp', label: 'C#', judge0Id: 51, monaco: 'csharp' },
};

const LANGUAGE_KEYS = Object.keys(LANGUAGES);

/**
 * Generic stdin/stdout templates, used when no AI-generated starter code exists
 * for a question (e.g. Gemini is not configured).
 */
const GENERIC_TEMPLATES = {
  python: `import sys

def solve(data):
    # TODO: implement your solution
    return data

def main():
    data = sys.stdin.read().strip()
    print(solve(data))

if __name__ == "__main__":
    main()
`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    static String solve(String data) {
        // TODO: implement your solution
        return data;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) sb.append(line).append("\\n");
        System.out.println(solve(sb.toString().trim()));
    }
}
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

string solve(const string& data) {
    // TODO: implement your solution
    return data;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    stringstream buffer;
    buffer << cin.rdbuf();
    cout << solve(buffer.str()) << endl;
    return 0;
}
`,
  c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void) {
    char line[100000];
    while (fgets(line, sizeof(line), stdin)) {
        /* TODO: parse input and implement your solution */
        printf("%s", line);
    }
    return 0;
}
`,
  javascript: `const data = require('fs').readFileSync(0, 'utf8').trim();

function solve(input) {
  // TODO: implement your solution
  return input;
}

console.log(solve(data));
`,
  go: `package main

import (
\t"bufio"
\t"fmt"
\t"io"
\t"os"
\t"strings"
)

func solve(data string) string {
\t// TODO: implement your solution
\treturn data
}

func main() {
\traw, _ := io.ReadAll(bufio.NewReader(os.Stdin))
\tfmt.Println(solve(strings.TrimSpace(string(raw))))
}
`,
  csharp: `using System;
using System.IO;

public class Program {
    static string Solve(string data) {
        // TODO: implement your solution
        return data;
    }

    public static void Main() {
        string data = Console.In.ReadToEnd().Trim();
        Console.WriteLine(Solve(data));
    }
}
`,
};

const getLanguage = (key) => LANGUAGES[String(key || '').toLowerCase()] || null;

const listLanguages = () =>
  LANGUAGE_KEYS.map((k) => {
    const { key, label, monaco } = LANGUAGES[k];
    return { key, label, monaco };
  });

module.exports = {
  LANGUAGES,
  LANGUAGE_KEYS,
  GENERIC_TEMPLATES,
  getLanguage,
  listLanguages,
};
