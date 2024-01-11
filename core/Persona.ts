// Copyright (c) 2023 TXPCo Ltd

import { InvalidParameterError } from './Errors';
import { MDynamicStreamable, DynamicStreamableFactory } from "./StreamingFramework";

// encoded via https://base64.guru/converter/encode/image
const unknownImageB64: string = "iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89 + bN / rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz / SMBAPh + PDwrIsAHvgABeNMLCADATZvAMByH / w / qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf + bTAICd + Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA / g88wAAKCRFRHgg / P9eM4Ors7ONo62Dl8t6r8G / yJiYuP + 5c+rcEAAAOF0ftH + LC + zGoA7BoBt / qIl7gRoXgugdfeLZrIPQLUAoOnaV / Nw + H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl / AV / 1s + X48 / Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H / LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAART5JREFUeNrs3Xl8VNXd+PHvuZOwgywCAoHMTAKyKTvIIgS0qBQQLG5P6wLSikuBag2KGxZBwErFaqUtglT7UBXFArXuJhB2wqJsQnLPHQggIIusgWTu+f1R7GP7c2EJ3HtnPu/Xi9fTPlXmzPnemfvJzSzKGCMAACC5KAIAAAACAAAAEAAAAIAAAAAABAAAACAAAAAAAQAAAAgAAABAAAAAAAIAAAAQAAAAgAAAAAAEAAAAIAAAAAABAAAACAAAAEAAAAAAAgAAAAIAAAAQAAAAgAAAAAAEAAAAIAAAAAABAAAACAAAAEAAAAAAAgAAABAAAACAAAAAAAQAAAAgAAAAAAEAAAAIAAAAQAAAAAACAAAAAgAAABAAAACAAAAAAAQAAAAgAAAAAAEAAAAIgOTbVKXYBPhOWlpaxQoVKlQpKSmpYllWVdd1q4iIWJZ12HXdQ6mpqYeLi4sPFxUVHWO34DecqwgAAgD4hnbt2qXu2bOnsWVZjZVSTUSk8ck/VUSkqjGmilKqysn/HjrFvzYuIoeNMYeVUodF5JCIHBaRLSKyxRiz2XXdLbVr196Sn59fwhRAABAAIABwjoTD4erGmM5Kqf8+0Uc8Xpr+ZhgYY7YopZY4jnOAqYEAIAAIAOA0NWnSpEE8Hu9ojOlujMkSkdYBuwtrlFI5SqkFoVBo+ebNm7czVRAABAABAPyXaDTaxBjTUUQ6isjlATzh/2AQiMhCEVmulFpu2/Zmpg4CgAAgAJCU0tPTeyql+ovIj5RSLZLsyXy9iHxgjJkbi8U+4WgAAUAAEABI9JN+G6VUPxHpr5Rqx46IGGPyRWSuMWZeLBZbzY6AACAACAAkhHA4HP76pC8iV7Ij3+vDr2PAcRyH7QABQAAQAAiaUCQS+R8R+frEX54tOS3HRWSuiMzTWv+v/OutiSAAQAAQAPCnzMzMaqWlpYOVUkNE5FJ2pEx8aoyZnpKSMqOgoOAg20EAgAAgAOAb4XD4IqXUEGPMEKVUBjtyTk4AhUqp6caY6Y7jfMGOEAAgAAgAePkTf0Y8Hh8iIkNE5CJ25Lz4QkSmh0Kh6QUFBYVsBwEAAoAAwHkTiUQuPfkT/2ARqcaOeOKgUmqGMWa61vpTtoMAAAFAAOCcadKkSYOSkpJRInK3nPpn6+PciovIH1JTUyfyiYMEAAgAAgBlLhwO36mUGiXef/4+vp02xkx0HOePbAUBAAKAAMBZi0aj3Ywxo0SkL7sRCPOVUhNt285jKwgAEAAEAM7kJ/7qlmU9ePLkj+A9Die6rjuBbyYkAEAAEAA4ZZFI5GfGmAeT7TP6E/CksV4pNUFr/Sq7QQCAACAA8H0n/lYi8pCI3MhuJJTXROQprfVatoIAAAFAAOA/hMPh25VSE0WkDruRkHYbY0Y5jvMyW0EAgAAgACDhcLjCyRP/cHYjKTx3MgSK2QoCgAAAAZCk0tPTu1iWNVFEurEbSSXPdd1RsVhsMVtBABAAIACSTCQSuUdEJopIZXYjKR0RkVFa6xfYCgKAAAABkAQaNGhQq1y5chNF5A52AyLy0okTJ0Zt3759L1tBABAAIAAS96f+H538qb8Nu4FvWH3yasAHbAUBQACAAEi8k/9QEfkzO4Hv8XOt9TS2gQAgAEAAJM7J/2EReZKdwCl4RGs9jm0gAAgAEADBP/k/JyK/ZCdwGn6vteZtoQQAAQACIMAn/9dE5AZ2Amfgda01nwhJABAAIAACePLPEZEe7ATOQq7WOottIAAIABAAwTn5bxSRpuwEysAmrXUztoEAIABAAPj/5L9PRGqwEyhD+7XWNdkGAoAAAAHg35P/URGpyE78n9TU1OMVKlQ4XqlSpeIKFSocr1KlyokKFSqcqFy5comIyJEjR1KLi4vLHT58uFxxcXH5o0ePViguLi5fUlJSnt37D8e01pXYBgKAAAAB4L+T/2ci0jJZ73/dunV3t2vXrqhTp06H2rRpEwqHwzWrVKkSFpEzPWkdPXz4sOM4zr7Vq1fHly1bVjU/Pz9t165dyfxtieu01pfwaCMACAAQAP45+b8tItcmy/2tXLny4SuuuGJT3759j7Rr1+6CCy64oJFlWeflErXruvu++uqrrfn5+V/Nnz+/8kcffdT0yJEjVZLocPu71noAjzoCgAAAAeD9yf8ZEbkvke9jgwYNdl5xxRXOVVddVdKiRYta1apVa+Gn9R08eHD9+vXr97733nupH330UXj79u31Evywm6y1vp9HHwFAAIAA8Eg0Gn3QGPNUIt63Cy644Kvbbrvts0GDBqWmpaV1CtLai4qKls2ePbtk5syZl3z11VcXJOjj/CHbtifwKCQACAAQAOf/J/9fishziXa/+vfvv/L2228/eumllza1LCvQv293XXf3p59+uunll1+uNHfu3PYJeBgO11r/nkcjAUAAgAA4fz/5DzHGvJRAMbP1V7/6ld2rV696lSpVujgRZ3b06NHPc3Nzv/jtb38b0Vo3SqDH+x22bU/nUUkAEAAgAM6xcDh8o1Lqb4lwX7p16/bZfffdt79Vq1btlFKVk+SJ/MjatWvzJ0+eXCMvL++SBLlPNzmO8xqPTgKAACAA2IRzJCMjo6Xruu+LSKBfZHbzzTcvveuuu1TQfrdf1oqKipa9+OKLZtasWZcF/K7stCyrd2Fh4ToepQQAAUAA4Nz89P8PpVSfoK5/xIgReYMHD76gWrVqvJf8Gw4ePPjZjBkzvpoyZUq3AJ+g3nEc58dMkwAgAAgAlLFIJPKkiDwcxLV379790/HjxxfXr1+/I5P8bjt27Fg+evToCgsWLLg0oHdhnNb6ESZJABAABADKSDQavc4Y82bQ1l2rVq19Tz/99GdZWVl8K+FpyMnJyX3ggQcu2bt3b80APv5/Ytv2W0yRACAACACcpfT09IhlWe+LSGaQ1j1ixIi8u+66K61cuXJhpnj6Tpw44bz44otFAfy1QIHrur1jsZhmigQAAUAA4CxEIpHXReT6oKy3YcOGO1599dWtDRs2vIzpnb1t27Yt/dnPftZo27Zt9QO07De01jcwPQKAACAAcIai0ehDxpjxQVlvv3798idNmlS9fPnyGUyv7Bw/frwwOzv7wLx589oF6HlgtG3bTzE9AoAAIABwmsLh8FVKqXeDst7HH38897bbbrtcRCymd064M2fOXPjEE08E5vUUxpirHcd5j9ERAAQAAYBTP/lXUEotFpE2fl9ramrqiVmzZi1t27ZtdyZ37q1atWrBzTfffFlJSUm5ACx3tTGmi+M4xUyOACAACACcgkgk8rCIPOn3dbZs2bLg5ZdfPlSzZs02TO382bdv3+rbb7+96rp164LwwtBHtNbjmBoBQAAQAPgB6enpzSzLWiwi1f28zqysrE//+Mc/XpCamprO1M6/kpKS2J133vlVTk6O3z8z4IDrul1isdhGpkYAEAAEAL7/p/9pInKHn9c4aNCgFZMmTerAtLyXnZ29Yvbs2X6fxUta66FMiwAgAAgAfIdoNNrHGPMPP69x2LBhi7Kzs7syLf+YNGnSoqlTp3b1+fPCj23bfodpEQAEAAGAbxEOhz9SSvXy6/qmTZuW26tXLz7Vz4c+/vjj3KFDh/p2NsaYjx3HuYJJEQAEAAGA/xKJRO4Rkef9ur5ly5bl165dux2T8q89e/bkd+rUyc8zuldr/QKTIgAIAAIAJ6Wnp9ezLGuRiET8uL4lS5asqFu3Lr/zD4Bdu3at6Ny5s19npV3X7RqLxXYyKQKAACAA8K+f/n8rIvf7cW0ff/zxknA43JkpBYfjOEt69erl15k9o7X+NVMiAAgAAoCf/tPT21qWle/Htc2aNWtBp06d+ICfAFq2bNmCm2++2Zezc123XSwWW8WUCAACgABIauFw+A9Kqbv8tq5JkyblDBo0KIsJBdfs2bNzsrOzfTdDY8yLjuPczYQIAAKAAEhaGRkZLV3XzRcRX32s6z333JN3//33d2NCwffMM8/kvfDCC36b5QnLstoVFhauY0IEAAFAACSlaDT6rDFmhJ/W1LFjxw2zZs1qqJSqyoQS4sRx6Oabb962fPny5j57nphi2/ZIJkQAEAAEQNKJRCIXi0i+iFT207pWrFixqlatWm2ZUOLYu3fvqg4dOvhtpkdEpJ3W+nMmRAAQAARAsgXA0yLiq1dDT506Nad3795ZTCfxvP/++znDhg3z22x/q7V+gOkQAAQAAZA00tPTIydf+V/DL2saNGjQ8kmTJnVkOokrOzt7+ezZs/004/0n3xGgmQ4BQAAQAMny0/84ERntl/XUrl37y9zc3AMVKlTIZDqJq7i4uKBHjx7V9+zZc6GPljVea/0w0yEACAACIOFlZmamxePxfBGp45c1zZ07d2HLli0vZzqJb926dQv79+/vp1nvDoVC7QoKCoqYDgFAABAACS0cDo9RSj3ul/UMHTp08ejRo7swmeQxfvz4xdOmTfPNzI0xTziOM4bJEAAEAAGQ0CKRyAoRae+HtVSsWPHoihUrtlWqVOliJpM8jh49+nmHDh0aHjt2rJJPlrRSa813TRAABAABkNAn/+4ikuuX9Tz33HM5ffv2zWIyyWf+/Pk5w4cP99Pse2itFzAZAoAAIAASNQAmiYgv3vbUtm3bTbNnz24kIpWYTHJeCBg0aNDWVatWNfXJep7WWmczFgKAACAAEjUANohIMz+s5cMPP1wcjUb53X8Ss2178ZVXXumXY2Cj1ro5UyEACAACIOGkp6dfY1nWO35YCy/8w9f89IJA13X7xGKxfzIVAoAAIAAS7af/F0TEF9+Atm7duk2VKlVqylRw9OjRTS1btvTLsfAHrfU9TIUAIAAIgIQRDocrKKU+F5FGXq/lgQceWHjXXXfxnn/824svvrjw6aef9sMxsdUYc7HjOMVMhQAgAAiARPnpf5CIvMFP/+AqwA+6Xms9m6kQAAQAAZAoAfCyiNzGT//gKsAPmqm1vp2JEAAEAAEQeJmZmdXi8bgtIrX46R9cBfhBe0OhULSgoOAgUyEACAACINDC4fDVSinPX9nMT/8IylUAY8w1juO8y0QIAAKAAAi0SCTyGxF5lJ/+wVWAUzZWa/0YEyEACAACIOgB8KGIXOHlGgYNGrR80qRJHZkGfkh2dvby2bNne32sfKS1vpJpEAAEAAEQWGlpaRVTU1P3ikhFL9fB1/3iVPnk64KPlZSU1CoqKjrGRAgAAoAACCQ//P6/atWqB1evXn3CsqwLmQh+iOu6X7Zp06bcoUOHqnl8wuN1AAQAAUAABDoAxiulHvJyDcOGDVuUnZ3dlWngVE2aNGnR1KlTPT1mjDFPOY4zmmkQAAQAARBIkUhkgYh4ejn1k08+WZqenn4Z08CpisViS3v27On1MbNQa92daRAABAABEEShSCRyXERCXi2gUaNG23NycmqJSAXGgdNQnJWVtXfr1q0NPFxDXGtdXkTijIMAIAAIgEBJT0/vaVnWx16u4ZFHHlkwZMgQforCaZs+ffqCJ5980tNjx3XdXrFY7BOmQQAQAARAoITD4TFKqce9XMPHH3+8JBwOd2YaOF2O4yzp1auXp8eOMeYJx3HGMA0CgAAgAAIlEom8LiLXe7mGLVu27AyFQvWYBk5XPB7f2bhxY6+PnTe01jcwDQKAACAAgnYFYJ1SqoVXt9+uXbuNb7zxRjMmgTN1/fXXb8zPz/fsGDLGrHccpyWTIAAIAAIgaFcAPD24Ro8evWDo0KH8/h9nbNq0aQvGjx/v6TGkteYJhQAgAAiA4GjUqFHzUCi03ss18PY/nC0/vB0wHo+32Lp16wYCgHMVAUAABOWn/+tF5HUv11BYWLhfKVWDIxJncdLZn5GR4fUxdIPW+g1mwbmKACAAAiEcDj+ulBrj1e23atXq8zlz5lzM0YizNXDgwM/Xrl3r2bHEOwEIAAKAAAjaFQBP3wEwdOjQxaNHj+7C0YizNX78+MXTpk3z8ljinQAEAAFAAATqCoCn7wCYMmVKTr9+/bI4GnG25s2blzNixAjPjiXeCUAAEAAEQNCuAHh6YL3zzjuLmjZtyhcA4axt2rRpUZ8+fTw9lngnAAFAABAAgeCHdwCsWbPms2rVql3C0YizdfDgwc9at27t6bHEOwEIAAKAAAjKT/+9ReQ9L9dQUFCw27KsOhyNOFuu6+7OzMz0+li6Smv9PgEAAoAA8LVoNHqdMeZNr26/YsWKR9avX1+ZIxFlpUWLFkeOHTvm2TGllPqJbdtvEQAgAAgAv18BuFVEZnp1+61atdo8Z86cJhyJKCsDBw7cvHbtWi+Pqdu01n8hAEAAEAB+vwJwtzHmBa9uv3///iufffbZ9hyJKCsjR45cOXfuXM+OKaXUPbZt/4EAAAFAAPhaOBzOVkpN9Or277jjjsUPP/wwnwGAMjNu3LjFL730kmfHlDFmlOM4kwgAEAAEgK9FIpGxIvKIV7fPlwChrPngS4Ge1Fo/SgCAACAA/H4F4HdKqZFe3f7kyZNzBgwYkMWRiLLy9ttv59x3332eHVPGmGcdx/kVAQACgADw+xWAP4vIUK9u/5VXXsnt2rVrD45ElJVFixbl3nLLLV4eU9O01j8nAEAAEAC+Fo1GZxljbvLq9ufNm5fXokWLbhyJKCvr16/P69evn2fHlFLqb7Zt30wAgAAgAPx+BWCeiPT16vYXLFiwLC0trRNHIspKUVHRsu7du3t5TM3XWvcjAEAAEAB+D4BPRCTLq9vPz89fU6NGjdYciSgr+/fvX9OuXTsvj6kcrXVPAgAEAAHAFQCuAIArAAQACAACwF+i0ej/GmM8+33l3Llz81q2bMlrAFBm1q1bl9e/f38vXwMwy7bt/yEAQAAQAH6/AvAnEfHsFcszZ87Mvfzyy3kXAMrMwoULc2+77TYvj6k/a61/QQCAACAA/B4Az4jIfV7d/tNPP53zk5/8JIsjEWXlzTffzHnggQe8PKYma63vJwBAABAAvhaNRp8wxjzm1e1nZ2cvGDZsGJ8EiDIzderUBZMmTfLsmFJK/ca27ccJABAABIDfrwA8ICKefW754MGDlzz66KOdORJRVsaOHbtkxowZXh5T2VrrpwkAEAAEgK+Fw+FhSqkXvbr9Pn36rHr++efbciSirNx7772r3nnnHc+OKWPMXY7jTCUAQAAQAH6/AvAzEXnFq9vPzMx03n///TBHIspK7969nYKCAi+PqVu01q8SACAACAC/XwG4Vin1tle3b1mWW1BQYHEkogyj0nVd17NjyhgzwHGcvxMAIAAIAF+LRqNXGGM+9HINmzdvLkpJSUnjaMTZKi0tLWrSpImnx5JS6krbtj8iAEAAEAB+vwIQVkppL9ewYsWKVbVq1eJ1ADhre/fuXdWhQwdPjyVjTMRxHIcAAAFAAPheJBI5LCKVvbr9OXPmLGzVqtXlHI04W2vXrl04cOBAL4+lI1rrKsk+B85VBAABEJwAWC4iHby6/aeeeirnxhtvzOJoxNl67bXXch566CEvj6UVWuuOBADnKgKAAAiEaDQ6wxhzu1e3f/PNNy8dN27cZRyNOFsPP/zw0lmzZnl2LCmlXrZtezABwLmKACAAgnIFwNMPA0pPT9/2ySefNORoxNnq2bPntlgs5uWxlPQfAkQAEAAEQLCuAPQxxvzDyzVs2bJlRygUqs8RiTMVj8d3NG7c2NNjSCn1Y9u23yEAOFcRAARAIPjhnQDvv//+4szMzC4ckThTBQUFi3v37u3pMcQ7AAgAAoAACByv3wnAlwLhbHn9JUDCOwAIAAKAAAhoAHj6ToAWLVoUzps3L4NJ4Ez169evcP369V4eQ7wDgAAgAAiA4PH6nQAiIps2bbLLlSsXZRo4XSdOnLCbNm3q6bHDOwAIAAKAAAikcDg8Uin1Oy/XMG/evLwWLVp0Yxo4XevXr8/r16+fp8eOMeZXjuM8yzQIAAKAAAhaALRWSq32cg133HHH4ocffpgXAuK0jRs3bvFLL73k9QsA2ziOs4ZpEAAEAAEQOJFIZL+IVPfq9itXrnxkzZo1h0OhUF2mgVMVj8d3tW7dusqRI0cqe7iMA1rrGkyDACAACIBAikajc4wxA7xcw1tvvbWgdevWvBsAp2zNmjULrrvuOk+PGaXU27ZtD2QaBAABQAAEkh9eB9C/f/+Vzz77bHumgVM1cuTIlXPnzvX0mOH3/wQAAUAABFp6enpny7IWe72OjRs3FpYvX563BOIHHT9+vLBZs2aeHyuu63aJxWJLmAgBQAAQAEEVikQiX4qHrwMQEZk2bVpOr169shgHfsjHH3+cM3ToUK+PlQNa6wtFJM5ECAACgAAIrEgk8raIXOvlGrp16/bZX/7yl0uYBn7Irbfe+lleXp7Xx8rftdYDmAYBQAAQAEEPgNEiMs7rdSxatGhFvXr1OjARfJedO3eu6Nq1qx+OkYe11uOZCAFAABAAgRaNRq80xnzg9ToGDRq0fNKkSXysKr5Tdnb28tmzZ3t+jCilfmTb9odMhAAgAAiAQMvMzKxWWlpqK6VqcRUA/PT/gye6vSkpKdGCgoKDTIUAIAAIgMALh8PTlVKef6Y5VwHg95/+jTEzHMcZwkQIAAKAAEiUABiglJrjh7VwFQB+/en/5IluoOM4bzMVAoAAIAASRSgSiWwSkUyuAoCf/r9Tgda6qfD2PwKAACAAEkkkEnlGRO7zw1ry8vKW169fnwiA7NixY3m3bt38cixM1lrfz1QIAAKAAEgo4XA4Syn1iR/W0qtXrzXTpk1rzVQwdOjQNR9//LEvjgVjTE/HcXKYCgFAABAAiXgVYLmI+OJ3ra+99tqCDh068CVBSWzFihULbrzxRr8cAyu01lyVIgAIAAIgYQPgURH5jR/Wkp6eXvTRRx+VsyyrDpNJPq7r7r7iiitOxGKxNJ8s6TGt9VgmQwAQAARAogZAKxFZ45f1jB8/Pvemm27qwWSSz9/+9rfc0aNH+2n2rbXWa5kMAUAAEACJHAHvi8iP/LAWy7LcNWvWbKpSpUpzJpM8Dh8+vKF169ZNXde1fLKkD7TWvZkMAUAAEAAJLRwO36mUmuqX9QwePHjJo48+2pnJJI+xY8cumTFjhm9mbowZ5jjOH5kMAUAAEAAJrV27dql79+5drZRq4Zc1zZkzZ2GrVq0uZzqJb+3atQsHDhzom1kbY9bXqlWrTX5+fgnTIQAIAAIg4UWj0fuMMc/4ZT1Vq1Y9tGjRom38KiCxHT58eEPXrl0bHjp0qKqPni/ut217MtMhAAgAAiAphMPh6kqpVSIS8cuaTn42QHMRKceEEtKJoUOHbvDLe/5P0saYto7jHGA8BAABQAAkDT+9JfBrY8aMyb311lt5V0AC+stf/pI7ZswYv82Wt/4RAAQAAZB8mjRp0qCkpGSViPjqffjvvPPOoqZNm3ZlQolj06ZNi/r06eO3me5OTU1tu3nz5u1MiAAgAAiApBONRicYY0b5aU21a9f+Mjc3d1+FChWaMKHgKy4u3tyjR4+ae/bsudBnzxMTbdt+kAkRAAQAAZCsAdDEGLNKRCr7aV2tWrX6fPbs2VVDoVB9phRc8Xh8x6BBgw6tXbv2Yp8t7YhSqq1t25uZEgFAABAASSsSiTwnIr/027o6d+68/q9//WsLJhRcP/3pT9cvWbLEjzP8vdZ6OBMiAAgAAiCppaent7Esa5Uf18a3BgaXn77l77+5rts2FoutZkoEAAFAAHAVIBL5rYj48nvQ+/Xrt3LKlCntmVJwjBgxYuW8efP8OrNntNa/ZkoEAAFAAOBfVwHqWZa1SHz0uQDfdN999y289957+aTAAHj++ecXTp482a+z0q7rdo3FYjuZFAFAABAA+L+rAPeIyPN+Xd+UKVNy+vXrl8Wk/GvevHk5I0aM8POM7tVav8CkCAACgADAfwmHwx8ppXr5dX1PPPFE7i233MIHBfnQK6+8kvv444/7djbGmI8dx7mCSREABAABgG8RjUb7GGP+4ec18usA//H5Zf+vnxd+bNv2O0yLACAACAB8h0gkMk1E7vDzGu+4447FDz/8cFsRqcDEPFU8bty4VS+99FIXn6/zJa31UMZFABAABAC+R3p6ejPLshaLSHU/r7NPnz75U6ZMqRsKhdKY2vkXj8eLRowYseudd95p5/OlHnBdt0ssFtvI1AgAAoAAwA9fBXhYRJ70+zpbtmy55aWXXjpYu3btdkzt/NmzZ0/+HXfcUW3dunWNA7DcR7TW45gaAUAAEAA4BeFwuIJSarGItAnCeqdPn56blZXFiwPPg5ycnNwhQ4YEZa9XG2O6OI5TzOQIAAKAAMCpXwX4kYi8JyKB2NDBgwcvHj16dJjvDzg34vH4jvHjxzszZszoEpAlGxG5Smv9AdMjAAgAAgCnKRqN/soYMzko623cuLEzY8aM3fXr1+/I9MrOjh07lg8ePLjOli1bwgF6HrjPtu3fMT0CgAAgAHCGwuHwdKXU4CCt+YUXXsi95pprOohIJSZ4Vo7Onz9/+fDhw7MCdrKa4TjOEMZHABAABADOQlpaWs3U1NT3RCRQn8fftm3bTZMmTdoXjUa7MMXTZ9v24uzs7JqrVq1qGrClrywpKbmqqKhoH1MkAAgAAgBnfxWgh1LqPREpH7S1Dx06dPHIkSNrVapU6WImeQo/8h89+vmzzz67d9q0aUEMp+PGmKscx8llkgQAAUAAoIxEIpF7ReT3QVx7xYoVj06cOHF53759Owq/FvjOc//8+fOXjxo1quOxY8eCuke/1Fo/zygJAAKAAEDZR8AfReQXQV1/27ZtNz388MN72rRp00lEyjFRERE5sXr16mXjxo2rHcDL/d/0J631nYyTACAACACcAxdffHHVEydOvCcinYN8P1q2bFkwevTo7Z06dWqvlKqcpE/oR5YtW7Zy/PjxDdatW5cZ8LuzpFy5cld9/vnnh3iUEgAEAAGAcyQ9Pb2tUmquUqpB0O9LZmZm7KGHHtI9evS41LKsmskwP9d19+Xm5n761FNPRQoKCtIT4MS03RjTPxaLreLRSQAQAAQAm3DuI+Aay7LmikhKItyfBg0a7Bg1atTmrKysOlWqVGmeiDM7fPjwhpycnN0TJ05ssn379kT5sKRS13X7x2Kxf/KoJAAIABAA50k4HL5dKTUj0e5X586d19988817EiEGvj7pz5o1q/aSJUtaJOBJabDjOC/zaCQACAAQAOc/AkYppSYk6v37OgZ69OhxYdWqVVsGYc2HDh1al5ub+2WinvS/cUJ60HGciTwKCQACAASARyKRyCQReSAJ7ue2a665ZuvVV1/tNmvWrEkoFKrrh3XF4/FdGzdu3Pzuu+9a//znPxtprRsmwWH3tNY6m0cfAUAAgADw/uT4ZxEZmkz3uW3btptuvPHGXVdeeeUF1apVqxsKheqdpxP+zoMHD+768MMPv3rttdfqBvyte2dimtb65zzqCAACAASAfyJgtoj8JFnvf2pq6vEmTZoUNWvWbO8ll1xyrGnTpqpRo0aVK1asWCHlX1JDoVAFpVQ5pVRFpVT5k0+sx40xx4wxJ+LxeHFpaWlJaWlp6bFjx4q3bt16ZNOmTeazzz6ruHHjxlqbN29OKykpKZ/Eh9mbWutBPNoIAAIABIDPhMPhj5RSvdgJnIMT0MeO41zBThAABAAIAP9eCXhZRG5jJ1CGZmqtb2cbCAACAASA/yPgURH5DTuBMvCY1nos20AAEAAgAIITAbeKyEx2AmfhNq31X9gGAoAAAAEQMNFo9CfGmNnsBM7gcTzItu032QkCgAAAARBQ4XD4KqXUu+wETuNkc7XjOO+xEwQAAQACIPhXAroZY14RkTC7ge/hKKVusW07j60gAAgAEAAJIj09vY1lWTNEpBW7gW+x1nXdwbFYbDVbQQAQACAAEkxGRkYdY8xEY8zt7Aa+8Zh9WSk1qrCwcDe7QQAQACAAElg4HB6ulJooIhXYjaRWbIwZ5TjOc2wFAUAAgABIEtFotJuITDTGdGE3kvJxulhERvH7fgKAAAABkITq1q1buVKlShNF5B52I6m8cPTo0VG7du06wlYQAAQACIAkFolE7hCRiSJSi91IaHtFZJTW+iW2ggAgANhUAgAi8u93CUwUkR+xGwnpA9d1R/EqfwIABAABgG8VDodHKaUeFJHq7EZCOGCMmeA4zkS2ggAAAUAA4HtlZma2iMfjD4rIz9iNQHs1FApNKCgoWM9WEAAgAAgAnM7VgBuVUqNEpA27ESirjTETHcd5ja0gAEAAEAA4IyffKTBKRB4UkVR2xNdKRGTC0aNHJ/IKfwIABAABgDIRiUQ6GmMeVEoNZDd8eYKYo5SaoLVezm4QACAACACUuWg0OsQYc6eIdGQ3fGG5UuqPtm1PZysIABAABADOxxWBnymlhhhjerIbnjzOPjHGTNdav8puEAAgAAgAnHcZGRkDXdcdIiJ92Y3zYr5lWdMLCwvnsBUEAAgAAgCeC4fDVymlBovIjezGOfGaMWaG4zjvsRUEAAgAAgC+E41Gu7muO1gpNYTdKJMn/umWZc3gS3sIABAABAACIRKJXCwi/USkv4hczo6cloUiMldE5mmtP2c7wLmKACAAEEjhcLiTUqr/yRhoyY58q3UiMtcYM9dxnGVsBwgAAoAAQKLFwNUi0l8p1U9E0pJ8O4qMMfNEZK7jOO9ydIAAIAAIACS8unXrVq5YsWJ/pdQVxpjLlFItkuSJfL1Saqkx5qNjx47N5RP7QAAQAAQAktrJ1wx0E5HOiRQEX5/wRWSJiOTxO30QAAQAAQB8jyZNmjQ4ceLE5Uqpy0+GwaUBWfqnIpJnjFlYrly5hZs3b97ONEEAEAAEAHCG0tLSKqampjYRkcZKqcYi0sQY01hEGotInfO8nN0iskUptUVENhtjtojIlpKSks1FRUXHmBYIAAKAAADOg3A4XN2yrMYi0th13SZKqSpKqSrGmCoi8u8/xpgqSqmq3/j/iYgcFpHDxphDSqnDX/93ETmslDpsjDlsjDlsWdZmEdniuu4Wx3EOsOsgAAgAEAAAQAAQACAAAIAAIAAIAAAAAUAAEAAAAAKAACAAAAAEAAFAAAAACAACgAAAABAABAABAAAEAAgAAgAACAAQAAQAABAAIAAIAAAgAEAAEAAAQACAACAAAIAAIABAAAAAAUAAgAAAAAKAAAABAAAEAAEAAgAACAACAAQAABAABAAIAAAgAAgAAgAAQAAQAAQAAIAAIAAIAAAAAUAAEAAAAAKAACAAAAAEAAFAAAAAAQACgAAAAAIABAABAAAEAAgAAgAACAAQAAQAABAAIAAIAAAgAAgANpUAAAACgAAAAQAABAABAAIAAAgAAgAEAAAQAAQACAAAIAAIABAAAEAAEAAEAACAACAACAAAAAFAABAAAAACgAAgAAAABAABQAAAAAgAAoAAAAACAAQAAXAuhCKRyIWWZdWOx+MXMkUg4RxISUn5UkT2FBQUHCcAQAAkSQA0b968ytGjR3+slGpnjLlQKXWhiHzzTw0mBySNgyLypYjsEZE9SqkvjTF7jDH5lSpV+seGDRsOEwAEAAIcABkZGZnxeLyXZVkDjDHXMBkAp/gc9k/Xdd8OhUIfFxYWFhAABAACEADRaLSb67q9ROQqpVQXpgHgLE+8i0XkPcuyPrZtO48AIADgowDIzMysFo/Hfykit4jIxUwAwDnyuYj8taSk5IWioqJ9BAABAA8DIBqN3mWM+aWINGPnAZwnBUqpP1SoUOGFDRs2nCAACACcxwAIh8M3KqV+KSJd2XEAHlkrIi9orf9MABAAOMcBEI1GrzTGDBeRfuw0AJ9YpJR6wbbtWQQAAUAAlLFIJHKpUupXxpjb2WEAPvXeySsC8wgAAoAAKJuf+n8iIlOMMQ3YXQB+Z4x5yHGcCQQAAUAAnN3J/yFjzHh2FUDAImC64zh3EAAEAAFwZif/GVzyBxBgeTVr1uyVn59fQgAQAATAKQqHw4v4IB8ACWB3PB7vuXXr1g0EAAFAAHyPzMzM2vF4fIP86/P5ASAhGGMGOo7zNgFAABAA3yIjI6Or67p57CCABI2AUY7jTCIACAAC4BuaNGlyYUlJyR52D0CCPz8Osm37TQKAACAATopEIvuEr+QFkBxXApo5jrOJACAAkj4AIpHIPBHpy84BSBIlSqnatm1/RQAQAEkbAJFI5BERGcuuAUgyOVrrngQAAZCUARCJRIaKyJ/ZMQBJ+lw5xbbtkQQAAZBUARCNRn9sjJnPbgFI8ufLh2zb/sGPDeZcRQAkRABkZGS0c113rojUZ7cAJDtjzO2O48wkAAiAhA+AaDT6jjHmGnYKAEREZGcoFOpYUFBQRAAQAAkbANFo9KfGmFfZJQD4D+O01o8QAARAwgZAJBJZKiKd2CUA+A/74vF4h61bt9oEAAGQcAEQiUR+KSLPsUMA8K2e1lpnEwAEQEIFQFpaWs3U1NRlIpLJDgHAtzpsjOnwbZ8SyLmKAAhsAITD4ceVUmPYHQD43ufPb/1sAM5VBEAgAyAjIyPTdd1lIlKT3QGA73VCRDporT8lAAiAwAdAJBJ5TkR+yc4AwA8zxkx1HOcuAoAACHQANGzYMCMlJaWAXQGAU1daWpq5bdu2QgKAAAhsAITD4WFKqRfZFQA4rasAdzmOM5UAIACCHABvKqWu8/uaQ6FQyYUXXrivdu3ah+rVq3eYKQKJZe/evRW/+OKLC3bt2lUrHo+nBiAA3nIc5ycEAAEQyACoX79+pfLly38hIlX9uM4mTZroO+64Y+tVV11Vs1q1apcwOSA5FBcXb96wYcMX//jHP1JmzJjRxafLPHT8+PGLduzYcZQAIAACFwCRSOQGEXnNb+u76qqrVo8YMeJo06ZNuzItILkdPXp008yZM/c8/fTTl/tweTdqrV8nAAiAIAbATBG51S/rqly58uH58+evS09Pv4wpAfjvELjhhhtSNmzY4KcPK/uL1vo2AoAACGIA7BCRen5YU6NGjbZ/8MEHpampqelMCMB3KO7bt2+RjyJgp9a6PgFAAAQqADIyMrq6rpvnh/V07tx5/V//+tcWTAbAqfjpT3+6fsmSJb54zrAsq1thYeEizlUEQGACIBwOj1dKPeT1WurXr/9FXl5edRGpwGQAnOqVgG7duh3YsWPHRV4vxBjzlOM4ozlXEQCBCYBIJJInIp6/yG7lypWra9as2YapADgd+/btW92+fXs/PHcs0Vp34VxFAAQpADaJyMVeruORRx7JHTJkSA8mAuBMTJ8+PffJJ5/0+jlkq9Y6nXMVARCkANgrHn75T40aNfYvXbr0IC/6A3CmSkpKYpdddlm1/fv31/BwGXGtdQrnKgIgKAFgRSKRuJdreO6553L69u2bxTQAnI358+fnDB8+3Ovnkots297FNAgA38vMzKzjuq6nB+vixYtXXnTRRe2ZBoCzcfDgwc9at27t6SeFhkKhdlu2bFnFNAgA30tPT28eCoXWe/hgKd2yZYsrIuWYBoCz1bdv3wKPPxugv23b85gEAeB70Wi0u4jkenX7P/rRj9b88Y9/bM0kAJQFr38NYIy5S2s9lUkQAL6XkZFxnTHmTa9u/6c//enSsWPH8nG/AMrEihUrFtx4443dPVzCk7ZtP8okCADfi0Qiv1BK/dGr28/Ozl4wbNiw7kwCQFmwbXvxlVde6dm3BhpjZmithzAJAsD3otHoaBEZ59XtT548OWfAgAFZTAJAWdi7d++qDh06tPVwCe/btn0VkyAAgnAFYIxS6nGvbp+3AAIoS/v371/Trl271h4uIce27Z5MggAgAAgAAAQACAACgAAAQACAACAACAAABAAIAAIAAAgAEAAEAAAQACAACAAAIAAIABAAAEAAEAAgAACAACAAQAAAIAAIAAIABAAAAoAAIABAAAAgAAgAAiC5ZWRkPGSMGe/V7Y8fPz73pptu6sEkAJSFL774YmWXLl3ae7iED23b/hGTIAB8LxqN3iMiz3t1+3ffffeiX//6112ZBICysG7durz+/ft383AJ82zb7s8kCIAgBMCtIjLTq9vv16/fyilTprRnEgDKwkcffZTz85//PMvDJbxm2/ZNTIIA8L1wODzQsqy3vLr9tm3bbpo9e3ZTJgGgLMycOTP3iSee8OzXikqplwsLCwczCQLA9zIyMq4wxnzo1e3Xq1dv16JFi+oyCQBlYezYsYtnzJjRxavbN8a8qLW+m0kQAL4XjUY7isgyr24/JSWldPPmzSlMAkBZuPPOO9d88MEHrT1cwmTbtu9nEgSA70UikaZKqY1erqGwsHC/UqoG0wBwtvr06VO4adOmDA+XMM627UeYBAHgew0bNmyQmppa5OUaNm3aZJcrVy7KNACcrTZt2hz46quvqnu4hOG2bf+eSRAAvte0adOqJ06cOOjlGvLz89fUqFGjNdMAcDaMMV9lZGRc4OUaXNft4zjOP5kGAeD/TVVKIpGIpxv7wgsv5FxzzTVZTAPA2YjFYkt79ux5mZdrsCyrcUFBQQHTIAACEQDhcHidUqqFV2vo06fPqueff74t0wBwNqZOnbpg0qRJ3b1cg9aacxUBEKgrAK+LyPVerSE1NfXE559/bokI7wYAcMZ69+4dKygoSPdwCQVa68acqwiAIF0B8PQLgUR4HQCAs1NcXFzQvHnzTI+fT/9p23YfzlUEQJCuAFwvIq97uY4///nPOVdccUUWEwFwJlatWrVg0KBB3T1exu+11sM5VxEAgQmARo0aNQ+FQuu9XMfAgQNXPPPMMx2YCIAzMXbs2CUzZszo7PEyhmqtX+JcRQAEJgBExPN3AlStWvXQmjVrLKVUZaYC4DQVd+jQ4cjevXtrebkIy7IuKSwsXMe5igAIVAB4/U4AEZFFixatqFevHlcBAJyWnTt3rujatavXzx0HtdYXiIhwriIAgnYFwNN3AoiI3HDDDcsmTJjQiakAOB0PPvjgstdff93r5473tNZXEwAEQBCvAHj+TgARkWXLluXXrl27HZMBcCr27NmT36lTJz88ZzyptX6UACAAAhcA6enpbS3Lyvd6PYMHD17y6KOPdmYyAE6FT178JyJyvdZ6NgFAAAQuAEREIpHINhFJ83pNq1atWlu9evVWTAfA9zlw4MDatm3b+uK5wrKsxoWFhQUEAAEQ1AB4QUTu9npNw4YNW5Sdnd2V6QD4PpMmTVo0depUPzxXLNNa//s7CDhXEQCBC4BoNNrXGDPPD+tau3btuqpVq7ZkQgC+zaFDh9a1atXKF88RxpgnHMcZQwAQAIENgObNm1c5duzYlyJS3ut1jRw5cuHw4cMvZ0IAvs1zzz238Nlnn/XFc4Qx5jLHcZYRAARAYANAxB9vB/zaihUrVtWqVYtvCQTwH/bt27e6ffv2bXyynP+4/E8AEACBDYBoNHq3MeYFP6ytbdu2n7/++uu1LcuqyaQAnHT0lltusRctWuTLy/8EAAEQ2ABIT09vZlnWBr+sb/jw4XkjR47sxqQAiIi8+uqruY899lgPv6znvy//EwAEQGADQEQkEoksEZHL/LLGv/3tb7kdO3bswbSA5OY4zpJevXr56XNC/r/L/wQAARDoAPDTrwFERFJTU48vW7ZsE58NACSveDy+o3fv3qVa60Y+ev68z7bt3xEABEDCBEBaWlrF1NTU1SJysV/W2blz5/WvvvpqI6VUVaYGJJ8JEyYs+tOf/uSnzwf50hhzieM4XxAABEDCBICISDgczlZKTfTTWrOzsxcMGzasO1MDksuKFSsW3HjjjX577P9eaz382/4HzlUEQKADIDMzs3ZpaelqpVQDP633pZdeyunZs2cWkwOSQ1FR0bKsrKwOrutaflqX67pdYrHYEgKAAEi4ABARiUQiY0XkEb+t+c0331zYpk0bPiQISHC7du3Kz8rKan78+PGKPlvaPK11/+/6HzlXEQCBD4D09PSIZVmrReQCv6170aJFK+rVq9eBCQKJ6cSJE06nTp2qf/XVV9V9+Lz5P7ZtzyIACICEDQARkXA4/Dul1Ei/rTs1NfXEhg0b9odCobpMEUg4bufOnb/ctWtXHR+ubYXWuuP3/QOcqwiAhAiASCRyqYisEpGQ39Zeq1atvStWrKjFFIHE0rNnz6JYLJbmx7UppYbYtj2DACAAEj4ATkbA8yJyjx/X36pVq81z5sxpwiSBxHD99ddvys/Pb+rT5S3UWv/guxE4VxEACRMAjRo1ioZCocUi4svL7V27dl33yiuv8NXBQMDdeeedaz744IPWPn6+/N7f/RMABEDCBYCIPz8X4Jtatmy5Ze7cuY2ZKMDJ/xz5QGvd+1T+Qc5VBEBCBUBWVlZKLBZbLCK+feV9JBLZ9tFHHzVkqgAn/7Lmuu51sVhsDgFAACRdAJy8CnCTUmqWn+9P7dq19yxbtqw2kwU4+Zehv2utB5zqP8y5igBIuAA4+VP2bBH5iZ/vU8WKFY+sX7++MtMFOPmXgUOu62bFYrFVBAABkNQBkJGR0cV13UVBuG8FBQX7LMuqyZQB/7n11ls/y8vLuyQAS83WWj99Ov8C5yoCICEDQEQkHA5PVkr9Kgj3b/Xq1Z9ecMEFlzJpwB9KSkq2tW3btuaRI0eCcJXuPa311af7L3GuIgASNgAyMzPT4vF4rohEg3Af586du7Bly5Z8dwDgsaKiomXdu3fvFJDlllqWlVVYWHjaVzw5VxEACRsAIiKRSGSQiLwRlPs5fvz43JtuuqkHEwe8MX/+/Jzhw4dnBWjJj2mtx57Jv8i5igBI6AAQEQmHw+OVUg8F5b4OGjRoxbhx4+qkpqamM3ng/CgpKdk2ZsyY7bNmzbosQMt+V2t9zZn+y5yrCICED4CTVwL+KSJXB+X+RiKRra+88soX9evX78j0gXNrx44dy2+55ZaLtNaNArRsxxhzjeM4mwgAAoAA+P4TaisReV9E6gTpfk+dOjWnd+/eWRwBwLnx/vvv5wwbNixwjzFjzEDHcd4+y7+DA4AASPwAEBEJh8O3K6VmBO2+Dx48ePHo0aMjoVCoHkcCUDbi8fjO8ePH6xkzZnQJ4Mn/IcdxJpTB38OBQAAkRwCcvBLwnIj8Mmj3v3nz5gXTp08/UKdOnfYcDcDZ2b1798ohQ4ZU37BhQ2YAnwtftm17cBmFBAcDAZA8AZCWllYxNTX1AxHpGsR9mDlzZu7ll1/OuwSAM7Rw4cLc2267LaiPoaUnf+9/gAAgAAiAM5Cent7Gsqy3RaRREPdiwIABK8aMGVOhWrVql3BkAKfm4MGDn40ZM6b47bff7hDQu7DVdd0BsVhsdVn9hZyrCICkCwARkWg0eqUx5m0RCeRn8VuW5f7ud79b0K9fv8tEpAJHCPCdiufNm7f0V7/6VXfXda2A3ocjSqkBtm1/WJZ/KecqAiApA0BEJBKJ3CAirwV5Xzp27Ljxt7/97cG0tLROHCXAfyoqKlr261//utry5cubBfyu3Ki1fr2s/1LOVQRA0gaAiEg4HL5NKfVy0PfngQceWPiLX/wiIxQK1edoQbKLx+M7/vSnPxU+/fTTgf9obWPM7Y7jzDxHfzcHCwGQvAFwMgKGKaVeDPoe1a9f/4uxY8duysrK6qCU4muGkXSMMUdycnJWPProo0137NhxUQLcn7scx5l6Dv9+DhoCILkDQEQkGo3eZ4x5JhH2qmnTpoVPPvnk9rZt23bnyEGyWLVq1YJHHnmkwaZNmzIS5Dnvftu2J5/jwODAIQAIABGRSCTysIg8mSh71rVr13WPPfbYV40bN+7KEYREtWXLlkW/+c1vLli0aFHLBLpbj2itx52HKwwcQAQAAZCoESAi0q9fv/wHH3zQrVevXgeOJCSKnTt3rpgwYYI1b968dol0v4wxTziOM+Y83RYHEgFAAHxTIv064Juuvfbalffdd1+8YcOGvGMAgbVt27ZlkydPDv39739PuE/FPJ8nfwKAACAAvkOivDDw21x99dWr77vvvmOZmZldOLIQFAUFBYsnT55c8d13322TiPfvfJ/8CQACgAD4/ghIiLcIfpdu3bp99uCDDx5s3rw5rxGAb23YsGHRhAkTquXl5SXsJ196cfInAAgAAuAHJMKHBf2Qdu3abRw5cuTuzp07N7Msqw5HG7zmuu7uJUuWbHz22Wfr5OfnN0vk++rVyZ8AIAAIgFMQjUb7GmPmJfoe16hRY9/dd9/92fXXX1+T7xmAFw4ePPjZG2+8se8Pf/jDJfv376+Z6PfXy5M/AUAAEACnHgFXGGM+TJb9vvbaa1feddddJ5o0adJRRFI4AnEOlW7evHn5iy++WC4RX9jn15M/AUAAEACn8UBp2LBhg9TU1K0iYiXLvjdp0kTfe++9saysrDpVqlRpzpGIsnL48OENOTk5u59//vn0zZs3R5Ls7ve3bXueH57XQAAQAKf4QFFKWZFIJEdELk+2GXTu3Hn9zTffvIcYwNme9GfNmlV7yZIlLZJwC75QSnUqLCzc6qfnNRAABMBpPFAikchTSqkHk3UexAA46Z+2v9q2/TM/P6+BACAATvGBkpGRcbcx5oVkn03nzp3XX3fddXuysrKq1apVq7Uk0a9I8K3cvXv3rsnJyTn41ltvJftJ/+vnr4cKCwsnBOF5DQQAAXCKD5TMzMyBruv+RUSqMCWRBg0a7BgwYID94x//WDVu3DgaCoXqsSuJLx6P79yyZYv9j3/8w7z99tvR7du387XU/1KilLq9sLDwf4P0vAYCgAA4xQdKOBzubFnWiyLSikn9H8uy4ldfffWa66677nD79u0vrFat2sXCOwoSRenBgwc/X7ly5ZdvvfVWlXfffbe167ohtuU/fKqUuqewsDAviM9rIAAIgFN8oGRmZtZxXXeSiNzGtL5djRo19nXr1k137979UOfOnSvVq1evsVKqBjvjf8aY/Tt37tyyZMmSowsWLKial5cXSYb36Z/Ffs0yxtzvOM7OID+vgQAgAE7jgZKRkTHSGDNJRFKZ2g9r2bLllt69e39x5ZVXWtFotF65cuWi7Ir3Tpw4Ydu2vfPDDz9033///YvWrVvXmF05ZY/Ytn1KX+VLABAASLAHSiQSyVJKTRIRvn73NJUvX/5Y+/btC7t167bvsssuU5mZmRdWrly5sfCrg3Ol9MiRI1sKCgq+XLp0qcnLy6u5cuXKjOPHj1dka06bbYy5X2v9diI+r4EAIABOPQKqn4yAnzO9s9e8efOCbt267brssstKw+Fwudq1a1evVKnSRfwK4ZSP3/1Hjx79Ys+ePQccxzmxdOnSlLy8vLobNmzIZHfKxDyl1P2FhYVbEvl5DQQAAXAaTr5VcJKIVGaKZa9q1aoHGzduvKNZs2YHWrRocbxJkyYqLS2tUpUqVaqWL1++aigUqi4ilRJ8G47G4/EDx48fP3T48OFDRUVFRzdv3mzWr19ffuPGjdW3bNlS/9ChQ9U4Ws7Zc8MErfVDyfS8BgKAADhFmZmZXYwxTxpjejLJ8698+fLFNWrUOFC3bt2DderUOVKvXr3j9evXP1GnTh23du3aqmbNmqHq1auXr1y5coUKFSpUTklJqWZZVnU5/792KHVd90BpaenB4uLiI0eOHCk+cODA8X379sX37Nljdu/ebe3YsaPczp07y+/evbvyrl27qu3fv7/68ePHKzBlT54TCpVSY2zbfjUZn9dAABAApyEajT4iIo8JLxAMytWFQzVr1vyqdu3ah2vUqFF8Lm5j//79Ffbs2VNl3759Fxw6dKgqux4YfygtLR23devWHcn+vAYCIOEDoKxkZGR0cV33MRG5iqkCgbPCGDPOcZy/J8Kd4VxFABAAHgiHw9lKqceE1wYAQTGupKRkXFFR0bFEuUOcqwgAAsAj0Wi0vTHmMRHpx4QB33pfRMZprRck2h3jXEUAEADeh8BIY8xDIlKHSQO+sVspNdG27cmJegc5VxEABIAPNGrUKBoKhUaIyHCmDXjuuXg8PmXr1q12It9JzlUEAAHgI+np6Z0tyxopIjcwdeC8e9113WdjsdiSZLiznKsIAALAnyEw0LKsESLSg+kD51yu67pTYrHYnGS605yrCAACwMfC4fAwpdQIEWnKUQCUuU3GmCmO40xNxjvPuYoAIAD8HwHVRWSkUmqYiNTlaADO2i5jzFQRedZxnAPJugmcqwgAAiAgMjIyGrquO0xE7hIRvgQHOH37ReRFy7KmFhYWbkv2zeBcRQAQAAHTsGHDjJSUlGEiMkxEqrAjwA86LCJTS0tLp27btq2Q7SAACAACINDS09ObWZb1dQiUY0eA/88JEZnquu7UWCy2ke0gAAgAAiChRCKRS40xd518jQCAf53cpiqlXtRaf8puEAAEAAGQ0Bo1atTcsqxBSqlBInIJO4Ik9JkxZrbrurO3bt26ge0gAAgAAiDpZGRkDIzH41/HAL8eQCI7YYyZHQqFZhcWFs5hOwgAAoAAwL9CINMYM8h13euVUm3ZESTQyWuVZVlvKKVmFxYWFrAjBAABQADgO0Sj0b7GmEEiMlBEqrEjCKCDIjJHKTXbtu35bAcBQAAQADgN6enp9UKh0ABjzLUichU7ggB4Tyn193g8/nYsFtvJdhAABAABgLMUDodbi8i1SqkBItKaHYGPrDHGvC0if3ccZw3bQQAQAAQAzl0MXHUyBq4VkfrsCDywwxjz95Mn/ffYDgKAAAABcB5lZmZWKy0t7aOU6ikiPUWkMbuCc2iLiHxijPkkJSXlnYKCgoNsCQFAAIAA8IFIJHK5MabnySDIYkdQBnKMMZ8opT7RWi9kOwgAAgAEgM81atQoGgqFvr4y0FP4VQFOzQ4R+UREPonH459s3brVZksIAAIABEBAZWZmli8tLc0Skc5KqctEpLPw9kL8yz5jzDIRWSoiy1JSUnIKCgqOsy0EAAEAAiABNW/evFxxcfHlruteThAknS9EZJlSaqkxZpHWOk9EeCIkAAgAEADJKhwOd1JKdRORy0WkrYg0ZFcSwiYRWWGMyUtJSVlUUFCwni0hAEAAEAD4To0aNaphWVYrEblUKXWpiLQSkUuF7yvwq6NKqTWu664VkTUisjYlJWUNl/MJABAABADKRHp6ejOl1DejoLGIREUkhd05L0pFxBaRzSKyVkTWKqXW2La9ha0hAEAAEAA476LRaCPXdaOWZUWNMVFjTFQpFT0ZB7XZodOyR0RsY4ytlLKVUrbrurZlWbZt21vZHgIABAABgEC4+OKLq544cSIqIulKqQbGmDQRSRORBif/b5qIVE6S7TgiIkUn/2wXkSKlVJExZruIxMqVK2d//vnnhzhqQAAQAAQAkkKjRo1qpKamNojH42lKqTRjTJplWReISHURqW6Mqf71f/7GHz848M0/Sql//2fXdb86eXIvCoVCRSUlJdu3bt26n2mDACAACADgLITDYS+C4N8neMdxDjAFEAAEAAAAIAAAAAABAAAACAAAAEAAAAAAAgAAABAAAACAAAAAAAQAAAAgAAAAAAEAAAAIAAAAQAAAAEAAAAAAAgAAABAAAACAAAAAAAQAAAAgAAAAAAEAAAAIAAAAQAAAAAACAAAAEAAAAIAAAAAABAAAACAAAAAAAQAAAAgAAABAAAAAQAAAAAACAAAAEAAAAIAAAAAABAAAACAAAAAAAQAAAAgAAABAAAAAAAIAAAAQAAAAgAAAAABl4f8NAOxm1vDAGAxMAAAAAElFTkSuQmCC";
const unknowUuid: string = "88a77968-2525-4b83-b396-352ca83d1680";
const nullUuid = "e2b46463-3b9f-494c-b744-02a63e18c9e1";

const className = "Persona";

// atob works in a browser, implement a fallback if we are in node. 
function callAtob(data_: string, forceShim: boolean): string {

   if (!atob || forceShim) {
      const atob = (data: string) => Buffer.from(data, 'base64').toString('binary');
      return atob(data_);
   }
   return atob(data_);
}

// Persona - aggregates name, thumbnail image & timestamp of last time we saw them
// excludes email and other PII so can be passed to client even when describing an individual.
export class Persona extends MDynamicStreamable {
   private _id: string;
   private _name: string;
   private _thumbnailB64: string;
   private _lastSeenAt: Date;

   /**
    * Create an empty Persona object - required for particiation in serialisation framework
    */
   public constructor();

   /**
    * Create a Persona object
    * @param id_ - id to use to generate uniqueness 
    * @param name_ - plain text user name.
    * @param thumbNailB64_ - encoded thumbnail image.
    * @param lastSeenAt_ - timestamp for last interaction seen by the framework
    */
   public constructor(id_: string, name_: string, thumbNailB64_: string, lastSeenAt_: Date);

   /**
    * Create a Persona object
    * @param persona - object to copy from - should work for JSON format and for real constructed objects
    */
   public constructor(persona: Persona);

   public constructor(...arr: any[])
   {

      super();

      if (arr.length === 0) {
         this._id = null;
         this._name = null;
         this._thumbnailB64 = null;
         this._lastSeenAt = null;
         return;
      }

      var localId: string;
      var localName: string;
      var localThumbNailB64: string;
      var localLastSeenAt: Date;

      if (arr.length === 1) {
         localId = arr[0]._id
         localName = arr[0]._name;
         localThumbNailB64 = arr[0]._thumbnailB64;
         localLastSeenAt = new Date(arr[0]._lastSeenAt);
      }
      else { 
         localId = arr[0];
         localName = arr[1];
         localThumbNailB64 = arr[2];
         localLastSeenAt = arr[3];
      }

      if (!Persona.isValidId(localId)) {
         throw new InvalidParameterError("Id:" + localId + '.');
      }
      if (!Persona.isValidName(localName)) {
         throw new InvalidParameterError("Name:" + localName + '.');
      }
      if (!Persona.isValidThumbnailB64(localThumbNailB64)) {
         throw new InvalidParameterError("Thumbnail:" + localThumbNailB64 + '.');
      }

      this._id = localId;
      this._name = localName;
      this._thumbnailB64 = localThumbNailB64;
      this._lastSeenAt = localLastSeenAt;
   }

   /**
    * Dynamic creation for Streaming framework
    */
   className(): string {

      return className;
   }

   static createDynamicInstance(): MDynamicStreamable {
      return new Persona();
   }

   static _dynamicStreamableFactory: DynamicStreamableFactory = new DynamicStreamableFactory(className, Persona.createDynamicInstance);
   streamOut(): string {

      return JSON.stringify({ id: this._id, name: this._name, thumbnailB64: this._thumbnailB64, lastSeenAt: this._lastSeenAt });
   }

   streamIn(stream: string): void {

      const obj = JSON.parse(stream);

      this.assign(new Persona (obj.id, obj.name, obj.thumbnailB64, new Date(obj.lastSeenAt)));
   }

   /**
   * set of 'getters' for private variables
   */
   get id(): string {
      return this._id;
   }
   get name(): string {
      return this._name;
   }

   get thumbnailB64(): string {
      return this._thumbnailB64;
   }

   get lastSeenAt(): Date {
      return this._lastSeenAt;
   }

   set id(id_: string) {
      if (!Persona.isValidId(id_)) {
         throw new InvalidParameterError("Id:" + id_ + '.');
      }

      this._id = id_;
   }

   set name(name_: string) {
      if (!Persona.isValidName(name_)) {
         throw new InvalidParameterError("Name:" + name_ + '.');
      }

      this._name = name_;
   }

   set thumbnailB64(thumbNailB64_: string) {

      this.setThumbnailB64(thumbNailB64_);
   }

   set lastSeenAt(lastSeenAt_: Date) {

      this._lastSeenAt = lastSeenAt_;
   }

   /**
    * test for equality - checks all fields are the same. 
    * Uses field values, not identity bcs if objects are streamed to/from JSON, field identities will be different. 
    * @param rhs - the object to compare this one to.  
    */
   equals(rhs: Persona): boolean {
      Persona
      return ((this._id === rhs._id) &&
         (this._name === rhs._name) &&
         (this._thumbnailB64 === rhs._thumbnailB64) &&
         (this._lastSeenAt.getTime() === rhs._lastSeenAt.getTime()));
   }

   /**
    * assignment operator 
    * @param rhs - the object to assign this one from.  
    */
   assign(rhs: Persona): Persona {
      this._id = rhs._id;
      this._name = rhs._name;
      this._thumbnailB64 = rhs._thumbnailB64;
      this._lastSeenAt = rhs._lastSeenAt;

      return this;
   }

   /**
    * Set thumbnail with an option to force use of browser shim for B64 encoding 
    */
   setThumbnailB64(thumbNailB64_: string, forceShim_: boolean = false) {

      if (!Persona.isValidThumbnailB64(thumbNailB64_, forceShim_)) {
         throw new InvalidParameterError("Thumbnail:" + thumbNailB64_ + '.');
      }

      this._thumbnailB64 = thumbNailB64_;
   }

   /**
    * test for valid id 
    * @param id - the string to test
    */
   static isValidId(id_: string): boolean {
      if (!id_) // Null keys are allowed if user object has not been originated from or saved anywhere persistent
         return true;

      if (id_ && id_.length > 0) // if the id exists, must be > zero length
         return true;

      return (false);
   }

   /**
    * test for valid name 
    * @param name - the string to test
    */
   static isValidName(name_: string): boolean {
      if (name_ && name_.length > 0)
         return true;

      return (false);
   }

   /**
    * test for valid thumbnail string 
    * @param thumbnail - the string to test
    */
   static isValidThumbnailB64(thumbNailB64_: string, forceShim_: boolean = false): boolean {

      if (thumbNailB64_ && thumbNailB64_.length > 0) { 

         var decoded = null;

         try {
            decoded = callAtob(thumbNailB64_, forceShim_);
         } catch (e) {
            // OK to fall through after supressing exception as decoded will be null.             
         }
         if (!decoded)
            return false;

         return true;
      }

      return (false);
   }

   private static _unknown: Persona = new Persona(unknowUuid, "Guest", unknownImageB64, new Date(0));
   private static _null: Persona = new Persona(nullUuid, "Null", unknownImageB64, new Date(0));

   /**
    * return persona details for 'unknown'
    */
   static unknown(): Persona {
      return Persona._unknown;
   }

   /**
    * return persona details for 'unknown'
    */
   static null(): Persona {
      return Persona._null;
   }

   /**
    * test if the persona details are the status 'unknown'
    * @param persona - the persona to test 
    */
   static isUnknown(persona: Persona): boolean {
      return (persona === Persona._unknown) ||
         (persona && persona.equals(Persona._unknown));
   }

   /**
    * test if the persona details are the status 'null'
    * @param persona - the persona to test 
    */
   static isNull(persona: Persona): boolean {
      return (persona === Persona._null) ||
         (persona && persona.equals(Persona._null));
   }

   /**
    * return persona details for 'unknown'
    */
   static unknownImage(): string {
      return unknownImageB64;
   }
}

