
import re

def check_button_balance(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove strings and comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    content = re.sub(r'//.*', '', content)
    content = re.sub(r'\'[^\']*\'', '', content)
    content = re.sub(r'"[^"]*"', '', content)
    content = re.sub(r'`[^`]*`', '', content, flags=re.DOTALL)

    # Simplified button check
    opens = [m.start() for m in re.finditer(r'<button', content)]
    closes = [m.start() for m in re.finditer(r'</button>', content)]
    
    print(f"Total <button opens: {len(opens)}")
    print(f"Total </button> closes: {len(closes)}")
    
    # Check for unclosed buttons
    stack = []
    tokens = re.findall(r'</?button|/>', content)
    for i, token in enumerate(tokens):
        if token == '<button':
            stack.append(i)
        elif token == '</button':
            if not stack:
                print(f"Unexpected close button at token {i}")
            else:
                stack.pop()
        elif token == '/>':
            # This is hard to match correctly without full parser
            pass
            
    if stack:
        print(f"Unclosed buttons indices: {stack}")

if __name__ == "__main__":
    check_button_balance('/Users/yangyihong/Downloads/awr/src/App.tsx')
